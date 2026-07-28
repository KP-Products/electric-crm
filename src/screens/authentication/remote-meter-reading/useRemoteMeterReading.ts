import { K_SIZE_0, K_SIZE_1 } from '@constant';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { RemoteMeterReadingImportResult } from 'model/remote-meter-reading';
import remoteMeterReadingServices from 'services/remote-meter-reading-services';
import { parseFormattedNumber } from 'utils/number-input';
import { formatUploadFileSize, getUploadFileSizeError, isValidUploadFileSize } from 'utils/upload';
import {
  ParsedRemoteMeterReadingWorkbook,
  ParsedSheet,
  ParsedSheetRow,
  parseRemoteMeterReadingWorkbook
} from './xlsxPreview';

const PREVIEW_PAGE_SIZE = 5;
const VALID_TOU_CODES = ['CD', 'BT', 'TD'];
const LEGACY_REQUIRED_METER_HEADERS = ['meter_number', 'customer_id', 'customer_name'];
const LEGACY_TOU_HEADERS = ['meter_number', 'tou', 'old_index', 'new_index'];
const IMPORT_REQUIRED_HEADERS = [
  'meter_number',
  'customer_id',
  'period_code',
  'period_from',
  'period_to',
  'reading_date',
  'tou',
  'old_index',
  'new_index'
];

export type RemoteImportTabKey = 'ALL';
export type RemoteImportValidationStatus = 'VALID' | 'WARNING' | 'ERROR';

export interface RemoteReadingTouDetail {
  id: string;
  lineNumber: number;
  tou: string;
  oldIndex?: number;
  newIndex?: number;
  usage?: number;
  energyRaw?: number;
  energyAdjusted?: number;
  messages: string[];
}

export interface RemoteReadingPreviewRow {
  id: string;
  lineNumber: number;
  meterNumber: string;
  customerId: string;
  customerName: string;
  periodCode?: string;
  periodFrom?: string;
  periodTo?: string;
  readingDate?: string;
  multiplier: number;
  activeEnergyIndex?: number;
  activeEnergyUsage?: number;
  energyAdjustedUsage?: number;
  reactiveEnergyIndex?: number;
  reactiveEnergyUsage?: number;
  status: RemoteImportValidationStatus;
  messages: string[];
  touDetails: RemoteReadingTouDetail[];
}

export interface RemoteReadingStats {
  total: number;
  valid: number;
  warning: number;
  error: number;
}

interface BuildPreviewResult {
  rows: RemoteReadingPreviewRow[];
  messages: string[];
}

interface ImportPreviewGroup {
  lineNumber: number;
  meterNumber: string;
  customerId: string;
  customerName: string;
  periodCode: string;
  periodFrom: string;
  periodTo: string;
  readingDate: string;
  multiplier: number;
  details: RemoteReadingTouDetail[];
  errors: string[];
  warnings: string[];
}

const getErrorMessage = (error?: any, fallback = 'Thao tác thất bại') => {
  return (
    error?.businessErrorMessage ||
    error?.systemErrorMessage ||
    error?.detailMessage ||
    error?.message ||
    fallback
  );
};

const getStringValue = (row: ParsedSheetRow, key: string) => {
  const value = row.values[key];
  if (value === undefined || value === null) return '';
  if (
    typeof value === 'number' &&
    ['period_from', 'period_to', 'reading_date'].includes(key) &&
    value > 20000
  ) {
    return dayjs('1899-12-30').add(value, 'day').format('DD-MM-YYYY');
  }
  if (typeof value === 'number') return Number.isInteger(value) ? String(value) : String(value);
  return value.trim();
};

const toNumber = (value?: string | number) => {
  return parseFormattedNumber(value);
};

const getMissingHeaders = (sheet: ParsedSheet | undefined, requiredHeaders: string[]) =>
  requiredHeaders.filter((header) => !sheet?.headers.includes(header));

const appendMessage = (map: Map<string, string[]>, meterNumber: string, message: string) => {
  if (!meterNumber) return;
  const messages = map.get(meterNumber) || [];
  messages.push(message);
  map.set(meterNumber, messages);
};

const getFileExtension = (fileName: string) => fileName.split('.').pop()?.toLowerCase() || '';

const isXlsxFile = (file?: File) => Boolean(file && getFileExtension(file.name) === 'xlsx');

const isExcelFile = (file?: File) => {
  const extension = getFileExtension(file?.name || '');
  return extension === 'xlsx';
};

const getStats = (rows: RemoteReadingPreviewRow[]): RemoteReadingStats => ({
  total: rows.length,
  valid: rows.filter((row) => row.status === 'VALID').length,
  warning: rows.filter((row) => row.status === 'WARNING').length,
  error: rows.filter((row) => row.status === 'ERROR').length
});

const downloadByBlob = (blob: Blob, fileName: string) => {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};

const buildTouDetails = (touSheet?: ParsedSheet) => {
  const detailsByMeter = new Map<string, RemoteReadingTouDetail[]>();
  const detailMessagesByMeter = new Map<string, string[]>();

  touSheet?.rows.forEach((row) => {
    const meterNumber = getStringValue(row, 'meter_number');
    const tou = getStringValue(row, 'tou').toUpperCase();
    const oldIndex = toNumber(row.values.old_index as string | number);
    const newIndex = toNumber(row.values.new_index as string | number);
    const messages: string[] = [];

    if (!meterNumber) messages.push(`Dòng ${row.rowNumber}: thiếu số công tơ`);
    if (!VALID_TOU_CODES.includes(tou)) {
      messages.push(`Dòng ${row.rowNumber}: khung giờ phải là CD, BT hoặc TD`);
    }
    if (oldIndex === undefined) messages.push(`Dòng ${row.rowNumber}: chỉ số đầu không hợp lệ`);
    if (newIndex === undefined) messages.push(`Dòng ${row.rowNumber}: chỉ số cuối không hợp lệ`);
    if (oldIndex !== undefined && newIndex !== undefined && newIndex < oldIndex) {
      messages.push(`Dòng ${row.rowNumber}: chỉ số cuối nhỏ hơn chỉ số đầu`);
    }

    if (messages.length) appendMessage(detailMessagesByMeter, meterNumber, messages.join('; '));
    if (!meterNumber) return;

    const details = detailsByMeter.get(meterNumber) || [];
    details.push({
      id: `${meterNumber}-${tou || row.rowNumber}`,
      lineNumber: row.rowNumber,
      tou,
      oldIndex,
      newIndex,
      usage: oldIndex !== undefined && newIndex !== undefined ? newIndex - oldIndex : undefined,
      messages
    });
    detailsByMeter.set(meterNumber, details);
  });

  return {
    detailsByMeter,
    detailMessagesByMeter
  };
};

const buildLegacyPreviewRows = (workbook: ParsedRemoteMeterReadingWorkbook): BuildPreviewResult => {
  const messages: string[] = [];
  const missingMeterHeaders = getMissingHeaders(workbook.meterSheet, LEGACY_REQUIRED_METER_HEADERS);
  const missingTouHeaders = getMissingHeaders(workbook.touSheet, LEGACY_TOU_HEADERS);

  if (workbook.missingSheets.length) {
    messages.push(`Thiếu sheet: ${workbook.missingSheets.join(', ')}`);
  }
  if (missingMeterHeaders.length) {
    messages.push(`Sheet Du_lieu_cong_to thiếu cột: ${missingMeterHeaders.join(', ')}`);
  }
  if (missingTouHeaders.length && workbook.touSheet) {
    messages.push(`Sheet Chi_tiet_TOU thiếu cột: ${missingTouHeaders.join(', ')}`);
  }
  if (!workbook.meterSheet || missingMeterHeaders.length) return { rows: [], messages };

  const { detailsByMeter, detailMessagesByMeter } = buildTouDetails(workbook.touSheet);
  const seenMeterNumbers = new Set<string>();
  const rows = workbook.meterSheet.rows.map<RemoteReadingPreviewRow>((row) => {
    const meterNumber = getStringValue(row, 'meter_number');
    const customerId = getStringValue(row, 'customer_id');
    const customerName = getStringValue(row, 'customer_name');
    const multiplier = toNumber(row.values.multiplier as string | number) || K_SIZE_1;
    const touDetails = detailsByMeter.get(meterNumber) || [];
    const touNewIndexTotal = touDetails.reduce(
      (sum, detail) => sum + (detail.newIndex || K_SIZE_0),
      K_SIZE_0
    );
    const activeEnergyIndex =
      toNumber(row.values.active_energy_index as string | number) ||
      (touDetails.length ? touNewIndexTotal : undefined);
    const reactiveEnergyIndex = toNumber(row.values.reactive_energy_index as string | number);
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!meterNumber) errors.push(`Dòng ${row.rowNumber}: thiếu số công tơ`);
    if (!customerId) errors.push(`Dòng ${row.rowNumber}: thiếu mã khách hàng`);
    if (!customerName) warnings.push(`Dòng ${row.rowNumber}: thiếu tên khách hàng`);
    if (meterNumber && seenMeterNumbers.has(meterNumber)) {
      errors.push(`Dòng ${row.rowNumber}: trùng số công tơ ${meterNumber}`);
    }
    if (activeEnergyIndex === undefined) {
      errors.push(`Dòng ${row.rowNumber}: thiếu chỉ số hữu công hoặc chi tiết TOU`);
    }
    if (activeEnergyIndex !== undefined && activeEnergyIndex < K_SIZE_0) {
      errors.push(`Dòng ${row.rowNumber}: chỉ số hữu công không được âm`);
    }
    if (!touDetails.length) warnings.push(`Dòng ${row.rowNumber}: chưa có chi tiết TOU`);

    (detailMessagesByMeter.get(meterNumber) || []).forEach((message) => errors.push(message));
    if (meterNumber) seenMeterNumbers.add(meterNumber);

    const status: RemoteImportValidationStatus = errors.length
      ? 'ERROR'
      : warnings.length
        ? 'WARNING'
        : 'VALID';

    return {
      id: meterNumber || `row-${row.rowNumber}`,
      lineNumber: row.rowNumber,
      meterNumber,
      customerId,
      customerName,
      multiplier,
      activeEnergyIndex,
      activeEnergyUsage:
        activeEnergyIndex !== undefined ? activeEnergyIndex * multiplier : undefined,
      reactiveEnergyIndex,
      reactiveEnergyUsage:
        reactiveEnergyIndex !== undefined ? reactiveEnergyIndex * multiplier : undefined,
      status,
      messages: [...errors, ...warnings],
      touDetails
    };
  });

  return { rows, messages };
};

const buildImportPreviewRows = (sheet: ParsedSheet): BuildPreviewResult => {
  const missingHeaders = getMissingHeaders(sheet, IMPORT_REQUIRED_HEADERS);
  if (missingHeaders.length) {
    return {
      rows: [],
      messages: [`File thiếu cột bắt buộc: ${missingHeaders.join(', ')}`]
    };
  }

  const groups = new Map<string, ImportPreviewGroup>();

  sheet.rows.forEach((row) => {
    const meterNumber = getStringValue(row, 'meter_number');
    const customerId = getStringValue(row, 'customer_id');
    const customerName = getStringValue(row, 'customer_name');
    const periodCode = getStringValue(row, 'period_code');
    const periodFrom = getStringValue(row, 'period_from');
    const periodTo = getStringValue(row, 'period_to');
    const readingDate = getStringValue(row, 'reading_date');
    const tou = getStringValue(row, 'tou').toUpperCase();
    const oldIndex = toNumber(row.values.old_index as string | number);
    const newIndex = toNumber(row.values.new_index as string | number);
    const energyRaw = toNumber(row.values.energy_raw as string | number);
    const energyAdjusted = toNumber(row.values.energy_adjusted as string | number);
    const multiplier = toNumber(row.values.multiplier as string | number) || K_SIZE_1;
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!meterNumber) errors.push(`Dòng ${row.rowNumber}: thiếu số công tơ`);
    if (!customerId) errors.push(`Dòng ${row.rowNumber}: thiếu mã khách hàng`);
    if (!periodCode) errors.push(`Dòng ${row.rowNumber}: thiếu mã kỳ`);
    if (!periodFrom) errors.push(`Dòng ${row.rowNumber}: thiếu từ ngày`);
    if (!periodTo) errors.push(`Dòng ${row.rowNumber}: thiếu đến ngày`);
    if (!readingDate) errors.push(`Dòng ${row.rowNumber}: thiếu ngày ghi`);
    if (!VALID_TOU_CODES.includes(tou)) {
      errors.push(`Dòng ${row.rowNumber}: khung giờ phải là CD, BT hoặc TD`);
    }
    if (oldIndex === undefined) errors.push(`Dòng ${row.rowNumber}: chỉ số đầu không hợp lệ`);
    if (newIndex === undefined) errors.push(`Dòng ${row.rowNumber}: chỉ số cuối không hợp lệ`);
    if (oldIndex !== undefined && newIndex !== undefined && newIndex < oldIndex) {
      errors.push(`Dòng ${row.rowNumber}: chỉ số cuối nhỏ hơn chỉ số đầu`);
    }
    if (
      row.values.energy_raw !== undefined &&
      String(row.values.energy_raw).trim() &&
      energyRaw === undefined
    ) {
      warnings.push(`Dòng ${row.rowNumber}: sản lượng thô không hợp lệ`);
    }
    if (
      row.values.energy_adjusted !== undefined &&
      String(row.values.energy_adjusted).trim() &&
      energyAdjusted === undefined
    ) {
      warnings.push(`Dòng ${row.rowNumber}: sản lượng hiệu chỉnh không hợp lệ`);
    }

    const groupKey =
      meterNumber && customerId && periodCode
        ? `${meterNumber}|${customerId}|${periodCode}`
        : `row-${row.rowNumber}`;
    const group = groups.get(groupKey) || {
      lineNumber: row.rowNumber,
      meterNumber,
      customerId,
      customerName,
      periodCode,
      periodFrom,
      periodTo,
      readingDate,
      multiplier,
      details: [],
      errors: [],
      warnings: []
    };

    if (tou && group.details.some((detail) => detail.tou === tou)) {
      errors.push(`Dòng ${row.rowNumber}: trùng khung giờ ${tou} của công tơ ${meterNumber}`);
    }

    group.errors.push(...errors);
    group.warnings.push(...warnings);
    group.details.push({
      id: `${groupKey}-${tou || row.rowNumber}`,
      lineNumber: row.rowNumber,
      tou,
      oldIndex,
      newIndex,
      usage:
        energyAdjusted ??
        energyRaw ??
        (oldIndex !== undefined && newIndex !== undefined ? newIndex - oldIndex : undefined),
      energyRaw,
      energyAdjusted,
      messages: [...errors, ...warnings]
    });
    groups.set(groupKey, group);
  });

  const rows = Array.from(groups.entries()).map<RemoteReadingPreviewRow>(([groupKey, group]) => {
    const totalNewIndex = group.details.reduce(
      (sum, detail) => sum + (detail.newIndex || K_SIZE_0),
      K_SIZE_0
    );
    const totalRaw = group.details.reduce(
      (sum, detail) =>
        sum +
        (detail.energyRaw ??
          (detail.oldIndex !== undefined && detail.newIndex !== undefined
            ? detail.newIndex - detail.oldIndex
            : K_SIZE_0)),
      K_SIZE_0
    );
    const totalAdjusted = group.details.reduce(
      (sum, detail) =>
        sum + (detail.energyAdjusted ?? detail.energyRaw ?? detail.usage ?? K_SIZE_0),
      K_SIZE_0
    );
    const status: RemoteImportValidationStatus = group.errors.length
      ? 'ERROR'
      : group.warnings.length
        ? 'WARNING'
        : 'VALID';

    return {
      id: groupKey,
      lineNumber: group.lineNumber,
      meterNumber: group.meterNumber,
      customerId: group.customerId,
      customerName: group.customerName,
      periodCode: group.periodCode,
      periodFrom: group.periodFrom,
      periodTo: group.periodTo,
      readingDate: group.readingDate,
      multiplier: group.multiplier,
      activeEnergyIndex: totalNewIndex,
      activeEnergyUsage: totalRaw,
      energyAdjustedUsage: totalAdjusted,
      status,
      messages: [...group.errors, ...group.warnings],
      touDetails: group.details
    };
  });

  return { rows, messages: [] };
};

function buildPreviewRows(workbook: ParsedRemoteMeterReadingWorkbook): BuildPreviewResult {
  if (workbook.readingSheet) return buildImportPreviewRows(workbook.readingSheet);
  return buildLegacyPreviewRows(workbook);
}

export default function useRemoteMeterReading() {
  const [selectedFile, setSelectedFile] = useState<File>();
  const [previewRows, setPreviewRows] = useState<RemoteReadingPreviewRow[]>([]);
  const [workbookMessages, setWorkbookMessages] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<RemoteImportTabKey>('ALL');
  const [keyword, setKeyword] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(K_SIZE_1);
  const [pageSize, setPageSize] = useState<number>(PREVIEW_PAGE_SIZE);
  const [checkingData, setCheckingData] = useState<boolean>(false);
  const [importing, setImporting] = useState<boolean>(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState<boolean>(false);
  const [importResult, setImportResult] = useState<RemoteMeterReadingImportResult>();
  const [checkedAt, setCheckedAt] = useState<string>('');
  const [previewBlockingError, setPreviewBlockingError] = useState<boolean>(false);

  const stats = useMemo(() => getStats(previewRows), [previewRows]);

  const filteredRows = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return previewRows.filter((row) => {
      const matchedKeyword =
        !normalizedKeyword ||
        row.meterNumber.toLowerCase().includes(normalizedKeyword) ||
        row.customerId.toLowerCase().includes(normalizedKeyword) ||
        row.customerName.toLowerCase().includes(normalizedKeyword) ||
        String(row.periodCode || '')
          .toLowerCase()
          .includes(normalizedKeyword);

      return matchedKeyword;
    });
  }, [keyword, previewRows]);

  const paginatedRows = useMemo(() => {
    const start = (currentPage - K_SIZE_1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [currentPage, filteredRows, pageSize]);

  const pagination = useMemo(
    () => ({
      current: currentPage,
      total: filteredRows.length,
      pageSize,
      onChange: (page: number) => setCurrentPage(page),
      showSizeChanger: false
    }),
    [currentPage, filteredRows.length, pageSize]
  );

  const tabItems = useMemo(
    () => [{ key: 'ALL' as const, label: `Tất cả (${stats.total})` }],
    [stats.total]
  );

  useEffect(() => {
    setCurrentPage(K_SIZE_1);
  }, [activeTab, keyword, pageSize, previewRows]);

  const onSelectFile = useCallback((file: File) => {
    if (!isValidUploadFileSize(file)) {
      showToast({
        type: TYPE_TOAST.ERROR,
        content: getUploadFileSizeError()
      });
      return;
    }

    if (!isExcelFile(file)) {
      showToast({
        type: TYPE_TOAST.ERROR,
        content: 'Vui lòng chọn file Excel đúng định dạng .xlsx'
      });
      return;
    }

    setSelectedFile(file);
    setPreviewRows([]);
    setImportResult(undefined);
    setWorkbookMessages([]);
    setCheckedAt('');
    setPreviewBlockingError(false);
    showToast({
      type: TYPE_TOAST.SUCCESS,
      content: `Đã chọn ${file.name} (${formatUploadFileSize(file.size)})`
    });
  }, []);

  const onRemoveFile = useCallback(() => {
    setSelectedFile(undefined);
    setPreviewRows([]);
    setWorkbookMessages([]);
    setCheckedAt('');
    setImportResult(undefined);
    setPreviewBlockingError(false);
  }, []);

  const onCheckData = useCallback(async () => {
    if (!selectedFile) {
      showToast({
        type: TYPE_TOAST.ERROR,
        content: 'Vui lòng chọn file Excel cần kiểm tra'
      });
      return;
    }

    setCheckingData(true);
    setImportResult(undefined);
    setPreviewBlockingError(false);

    if (!isXlsxFile(selectedFile)) {
      setPreviewRows([]);
      setWorkbookMessages(['Chỉ hỗ trợ kiểm tra và upload file .xlsx theo Swagger 5.2.']);
      setCheckedAt(dayjs().format('HH:mm DD/MM/YYYY'));
      setPreviewBlockingError(true);
      setCheckingData(false);
      return;
    }

    try {
      const workbook = await parseRemoteMeterReadingWorkbook(selectedFile);
      const result = buildPreviewRows(workbook);
      const nextStats = getStats(result.rows);

      setPreviewRows(result.rows);
      setWorkbookMessages(result.messages);
      setCheckedAt(dayjs().format('HH:mm DD/MM/YYYY'));
      setPreviewBlockingError(
        Boolean(nextStats.error || (result.messages.length && !result.rows.length))
      );

      if (nextStats.error) {
        showToast({
          type: TYPE_TOAST.ERROR,
          content: `Kiểm tra dữ liệu phát hiện ${nextStats.error} dòng lỗi`
        });
      } else if (nextStats.warning) {
        showToast({
          type: TYPE_TOAST.WARNING,
          content: `Kiểm tra dữ liệu có ${nextStats.warning} dòng cảnh báo`
        });
      } else {
        showToast({
          type: TYPE_TOAST.SUCCESS,
          content: `Dữ liệu hợp lệ: ${nextStats.valid} công tơ`
        });
      }
    } catch (error: any) {
      setPreviewRows([]);
      setWorkbookMessages([getErrorMessage(error, 'Không đọc được file Excel')]);
      setPreviewBlockingError(true);
      showToast({
        type: TYPE_TOAST.ERROR,
        content: getErrorMessage(error, 'Không đọc được file Excel')
      });
    } finally {
      setCheckingData(false);
    }
  }, [selectedFile]);

  const onImportData = useCallback(async () => {
    if (!selectedFile) {
      showToast({
        type: TYPE_TOAST.ERROR,
        content: 'Vui lòng chọn file Excel cần nhập'
      });
      return;
    }

    if (previewBlockingError || (previewRows.length && stats.error)) {
      showToast({
        type: TYPE_TOAST.ERROR,
        content: 'File còn dòng lỗi. Vui lòng kiểm tra lại trước khi nhập'
      });
      return;
    }

    setImporting(true);
    const response = await remoteMeterReadingServices.importRemoteMeterReadings({
      file: selectedFile
    });
    setImporting(false);

    if (!response?.data) {
      showToast({
        type: TYPE_TOAST.ERROR,
        content: getErrorMessage(response, 'Nhập dữ liệu đo xa thất bại')
      });
      return;
    }

    setImportResult(response.data);

    if (!response.data.success) {
      showToast({
        type: TYPE_TOAST.ERROR,
        content:
          response.data.errors?.[K_SIZE_0] ||
          getErrorMessage(response, 'File Excel có dữ liệu không hợp lệ')
      });
      return;
    }

    showToast({
      type: TYPE_TOAST.SUCCESS,
      content: `Đã nhập ${response.data.rowCount || stats.total} dòng chỉ số vào hệ thống`
    });
  }, [previewBlockingError, previewRows.length, selectedFile, stats.error, stats.total]);

  const onDownloadTemplate = useCallback(async () => {
    setDownloadingTemplate(true);
    const response = await remoteMeterReadingServices.downloadRemoteMeterReadingTemplate();
    setDownloadingTemplate(false);

    if (response?.data) {
      downloadByBlob(response.data, response.fileName || 'mau-nhap-chi-so-do-xa.xlsx');
      return;
    }

    showToast({
      type: TYPE_TOAST.ERROR,
      content: getErrorMessage(response, 'Không tải được file mẫu từ hệ thống')
    });
  }, []);

  const onChangeTab = useCallback((tab: RemoteImportTabKey) => {
    setActiveTab(tab);
  }, []);

  const onChangePageSize = useCallback((value: number) => {
    setPageSize(value);
  }, []);

  return {
    activeTab,
    tabItems,
    keyword,
    selectedFile,
    displayFileName: selectedFile?.name || 'Chọn file Excel',
    selectedFileSize: selectedFile ? formatUploadFileSize(selectedFile.size) : '',
    previewRows,
    paginatedRows,
    filteredRows,
    stats,
    workbookMessages,
    checkingData,
    importing,
    downloadingTemplate,
    importResult,
    checkedAt,
    pagination,
    currentPage,
    pageSize,
    canImportData:
      Boolean(selectedFile) &&
      !importing &&
      !checkingData &&
      !previewBlockingError &&
      !(previewRows.length && stats.error),
    onSelectFile,
    onRemoveFile,
    onCheckData,
    onImportData,
    onDownloadTemplate,
    onChangeTab,
    onChangeKeyword: setKeyword,
    onChangePageSize
  };
}
