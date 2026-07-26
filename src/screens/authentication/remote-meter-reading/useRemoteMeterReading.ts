import { K_SIZE_0, K_SIZE_1 } from '@constant';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { RemoteMeterReadingImportResult } from 'model/remote-meter-reading';
import remoteMeterReadingServices from 'services/remote-meter-reading-services';
import { FORMAT_DATE_API } from 'utils/date';
import { formatUploadFileSize, getUploadFileSizeError, isValidUploadFileSize } from 'utils/upload';
import {
  ParsedRemoteMeterReadingWorkbook,
  ParsedSheet,
  ParsedSheetRow,
  parseRemoteMeterReadingWorkbook
} from './xlsxPreview';

dayjs.extend(customParseFormat);

const REMOTE_READING_TYPE_INPUT = '2';
const PREVIEW_PAGE_SIZE = 5;
const DEFAULT_PERIOD = '07/2026';
const DEFAULT_READING_DATE = '22-07-2026';
const TEMPLATE_EXPORT_URL =
  'https://docs.google.com/spreadsheets/d/16anW_bKgAjQgvNKZR4KSVcW1uwlS4MDQ/export?format=xlsx&id=16anW_bKgAjQgvNKZR4KSVcW1uwlS4MDQ';

const METER_HEADERS = [
  'meter_number',
  'customer_id',
  'customer_name',
  'active_energy_index',
  'reactive_energy_index'
];
const REQUIRED_METER_HEADERS = ['meter_number', 'customer_id', 'customer_name'];
const TOU_HEADERS = ['meter_number', 'tou', 'old_index', 'new_index'];
const VALID_TOU_CODES = ['CD', 'BT', 'TD'];

export type RemoteImportTabKey = 'ALL' | 'VALID' | 'WARNING' | 'ERROR';
export type RemoteImportValidationStatus = 'VALID' | 'WARNING' | 'ERROR';
export type RemoteReadingSaveMode = 'OFFICIAL' | 'DRAFT';

export interface RemoteReadingTouDetail {
  id: string;
  lineNumber: number;
  tou: string;
  oldIndex?: number;
  newIndex?: number;
  usage?: number;
  messages: string[];
}

export interface RemoteReadingPreviewRow {
  id: string;
  lineNumber: number;
  meterNumber: string;
  customerId: string;
  customerName: string;
  multiplier: number;
  activeEnergyIndex?: number;
  activeEnergyUsage?: number;
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

const SAMPLE_METER_ROWS: ParsedSheetRow[] = [
  {
    rowNumber: 2,
    values: {
      meter_number: 'CT-11-19001234',
      customer_id: 1001,
      customer_name: 'Công ty TNHH An Phát',
      active_energy_index: 4900,
      reactive_energy_index: 150
    }
  },
  {
    rowNumber: 3,
    values: {
      meter_number: 'CT-12-19001235',
      customer_id: 1001,
      customer_name: 'Công ty TNHH An Phát',
      active_energy_index: 7380,
      reactive_energy_index: 180
    }
  },
  {
    rowNumber: 4,
    values: {
      meter_number: 'CT-13-19001236',
      customer_id: 1001,
      customer_name: 'Công ty TNHH An Phát',
      active_energy_index: 3150,
      reactive_energy_index: 110
    }
  },
  {
    rowNumber: 5,
    values: {
      meter_number: 'CT-14-19001237',
      customer_id: 1002,
      customer_name: 'Cửa hàng Điện Máy Minh',
      active_energy_index: 5250,
      reactive_energy_index: 120
    }
  },
  {
    rowNumber: 6,
    values: {
      meter_number: 'CT-15-19001238',
      customer_id: 1002,
      customer_name: 'Cửa hàng Điện Máy Minh',
      active_energy_index: 10900,
      reactive_energy_index: 200
    }
  }
];

const SAMPLE_TOU_ROWS: ParsedSheetRow[] = [
  ['CT-11-19001234', 'CD', 1250, 1380],
  ['CT-11-19001234', 'BT', 2340, 2520],
  ['CT-11-19001234', 'TD', 890, 1000],
  ['CT-12-19001235', 'CD', 2100, 2200],
  ['CT-12-19001235', 'BT', 3500, 3650],
  ['CT-12-19001235', 'TD', 1300, 1530],
  ['CT-13-19001236', 'CD', 900, 980],
  ['CT-13-19001236', 'BT', 1400, 1510],
  ['CT-13-19001236', 'TD', 600, 660],
  ['CT-14-19001237', 'CD', 1500, 1570],
  ['CT-14-19001237', 'BT', 2500, 2650],
  ['CT-14-19001237', 'TD', 800, 1030],
  ['CT-15-19001238', 'CD', 3000, 3200],
  ['CT-15-19001238', 'BT', 5000, 5450],
  ['CT-15-19001238', 'TD', 1800, 2250]
].map(([meterNumber, tou, oldIndex, newIndex], index) => ({
  rowNumber: index + 2,
  values: {
    meter_number: meterNumber,
    tou,
    old_index: oldIndex,
    new_index: newIndex
  }
}));

const SAMPLE_WORKBOOK: ParsedRemoteMeterReadingWorkbook = {
  meterSheet: {
    headers: METER_HEADERS,
    rows: SAMPLE_METER_ROWS
  },
  touSheet: {
    headers: TOU_HEADERS,
    rows: SAMPLE_TOU_ROWS
  },
  missingSheets: []
};

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
  if (typeof value === 'number') return Number.isInteger(value) ? String(value) : String(value);
  return value.trim();
};

const toNumber = (value?: string | number) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;

  const rawValue = String(value ?? '')
    .trim()
    .replace(/\s/g, '');

  if (!rawValue) return undefined;

  const hasDot = rawValue.includes('.');
  const hasComma = rawValue.includes(',');
  const normalized =
    hasDot && hasComma
      ? rawValue.replace(/\./g, '').replace(',', '.')
      : hasComma
        ? rawValue.replace(',', '.')
        : /^\d{1,3}(\.\d{3})+$/.test(rawValue)
          ? rawValue.replace(/\./g, '')
          : rawValue;

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const getMissingHeaders = (sheet: ParsedSheet | undefined, requiredHeaders: string[]) =>
  requiredHeaders.filter((header) => !sheet?.headers.includes(header));

const appendMessage = (map: Map<string, string[]>, meterNumber: string, message: string) => {
  if (!meterNumber) return;
  const messages = map.get(meterNumber) || [];
  messages.push(message);
  map.set(meterNumber, messages);
};

const getSamplePreview = () => buildPreviewRows(SAMPLE_WORKBOOK).rows;

const buildTouDetails = (touSheet?: ParsedSheet) => {
  const detailsByMeter = new Map<string, RemoteReadingTouDetail[]>();
  const detailMessagesByMeter = new Map<string, string[]>();

  touSheet?.rows.forEach((row) => {
    const meterNumber = getStringValue(row, 'meter_number');
    const tou = getStringValue(row, 'tou').toUpperCase();
    const oldIndex = toNumber(row.values.old_index as string | number);
    const newIndex = toNumber(row.values.new_index as string | number);
    const messages: string[] = [];

    if (!meterNumber) messages.push(`Dòng ${row.rowNumber}: thiếu meter_number`);
    if (!VALID_TOU_CODES.includes(tou)) {
      messages.push(`Dòng ${row.rowNumber}: TOU phải là CD, BT hoặc TD`);
    }
    if (oldIndex === undefined) messages.push(`Dòng ${row.rowNumber}: old_index không hợp lệ`);
    if (newIndex === undefined) messages.push(`Dòng ${row.rowNumber}: new_index không hợp lệ`);
    if (oldIndex !== undefined && newIndex !== undefined && newIndex < oldIndex) {
      messages.push(`Dòng ${row.rowNumber}: new_index nhỏ hơn old_index`);
    }

    if (messages.length) {
      appendMessage(detailMessagesByMeter, meterNumber, messages.join('; '));
    }

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

function buildPreviewRows(workbook: ParsedRemoteMeterReadingWorkbook): BuildPreviewResult {
  const messages: string[] = [];
  const missingSheets = workbook.missingSheets;
  const missingMeterHeaders = getMissingHeaders(workbook.meterSheet, REQUIRED_METER_HEADERS);
  const missingTouHeaders = getMissingHeaders(workbook.touSheet, TOU_HEADERS);

  if (missingSheets.length) {
    messages.push(`Thiếu sheet: ${missingSheets.join(', ')}`);
  }

  if (missingMeterHeaders.length) {
    messages.push(`Sheet Du_lieu_cong_to thiếu cột: ${missingMeterHeaders.join(', ')}`);
  }

  if (missingTouHeaders.length && workbook.touSheet) {
    messages.push(`Sheet Chi_tiet_TOU thiếu cột: ${missingTouHeaders.join(', ')}`);
  }

  if (!workbook.meterSheet || missingMeterHeaders.length) {
    return {
      rows: [],
      messages
    };
  }

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

    if (!meterNumber) errors.push(`Dòng ${row.rowNumber}: thiếu meter_number`);
    if (!customerId) errors.push(`Dòng ${row.rowNumber}: thiếu customer_id`);
    if (!customerName) errors.push(`Dòng ${row.rowNumber}: thiếu customer_name`);
    if (meterNumber && seenMeterNumbers.has(meterNumber)) {
      errors.push(`Dòng ${row.rowNumber}: trùng meter_number ${meterNumber}`);
    }
    if (activeEnergyIndex === undefined) {
      errors.push(`Dòng ${row.rowNumber}: thiếu active_energy_index hoặc chi tiết TOU`);
    }
    if (activeEnergyIndex !== undefined && activeEnergyIndex < K_SIZE_0) {
      errors.push(`Dòng ${row.rowNumber}: active_energy_index không được âm`);
    }
    if (!touDetails.length) {
      warnings.push(`Dòng ${row.rowNumber}: chưa có chi tiết TOU`);
    }
    if (
      activeEnergyIndex !== undefined &&
      touDetails.length &&
      Math.abs(activeEnergyIndex - touNewIndexTotal) > 0.001
    ) {
      warnings.push(`Dòng ${row.rowNumber}: active_energy_index chưa khớp tổng new_index TOU`);
    }
    if (
      row.values.reactive_energy_index !== undefined &&
      String(row.values.reactive_energy_index).trim() &&
      reactiveEnergyIndex === undefined
    ) {
      warnings.push(`Dòng ${row.rowNumber}: reactive_energy_index không hợp lệ, sẽ lưu null`);
    }

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

  return {
    rows,
    messages
  };
}

const getFileExtension = (fileName: string) => fileName.split('.').pop()?.toLowerCase() || '';

const isXlsxFile = (file?: File) => Boolean(file && getFileExtension(file.name) === 'xlsx');

const isExcelFile = (file?: File) => {
  const extension = getFileExtension(file?.name || '');
  return ['xlsx', 'xls'].includes(extension);
};

const getStats = (rows: RemoteReadingPreviewRow[]): RemoteReadingStats => ({
  total: rows.length,
  valid: rows.filter((row) => row.status === 'VALID').length,
  warning: rows.filter((row) => row.status === 'WARNING').length,
  error: rows.filter((row) => row.status === 'ERROR').length
});

const getPeriodDateRange = (periodStart: string, periodEnd: string) => {
  const start = dayjs(periodStart, 'MM/YYYY', true);
  const end = dayjs(periodEnd, 'MM/YYYY', true);

  if (!start.isValid() || !end.isValid()) {
    return {
      label: '',
      from: '',
      to: ''
    };
  }

  return {
    label: `${periodStart} (${start.startOf('month').format('DD/MM/YYYY')} - ${end
      .endOf('month')
      .format('DD/MM/YYYY')})`,
    from: start.startOf('month').format(FORMAT_DATE_API),
    to: end.endOf('month').format(FORMAT_DATE_API)
  };
};

const downloadByBlob = (blob: Blob, fileName: string) => {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};

const openExternalTemplate = () => {
  const link = document.createElement('a');
  link.href = TEMPLATE_EXPORT_URL;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default function useRemoteMeterReading() {
  const [selectedFile, setSelectedFile] = useState<File>();
  const [previewRows, setPreviewRows] = useState<RemoteReadingPreviewRow[]>(getSamplePreview);
  const [workbookMessages, setWorkbookMessages] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<RemoteImportTabKey>('ALL');
  const [keyword, setKeyword] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(K_SIZE_1);
  const [pageSize, setPageSize] = useState<number>(PREVIEW_PAGE_SIZE);
  const [periodStart, setPeriodStart] = useState<string>(DEFAULT_PERIOD);
  const [periodEnd, setPeriodEnd] = useState<string>(DEFAULT_PERIOD);
  const [readingDate, setReadingDate] = useState<string>(DEFAULT_READING_DATE);
  const [saveMode, setSaveMode] = useState<RemoteReadingSaveMode>('OFFICIAL');
  const [note, setNote] = useState<string>('');
  const [checkingData, setCheckingData] = useState<boolean>(false);
  const [importing, setImporting] = useState<boolean>(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState<boolean>(false);
  const [importResult, setImportResult] = useState<RemoteMeterReadingImportResult>();
  const [checkedAt, setCheckedAt] = useState<string>('');

  const periodInfo = useMemo(
    () => getPeriodDateRange(periodStart, periodEnd),
    [periodEnd, periodStart]
  );

  const stats = useMemo(() => getStats(previewRows), [previewRows]);

  const filteredRows = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return previewRows.filter((row) => {
      const matchedTab = activeTab === 'ALL' || row.status === activeTab;
      const matchedKeyword =
        !normalizedKeyword ||
        row.meterNumber.toLowerCase().includes(normalizedKeyword) ||
        row.customerId.toLowerCase().includes(normalizedKeyword) ||
        row.customerName.toLowerCase().includes(normalizedKeyword);

      return matchedTab && matchedKeyword;
    });
  }, [activeTab, keyword, previewRows]);

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
    () => [
      { key: 'ALL' as const, label: `Tất cả (${stats.total})` },
      { key: 'VALID' as const, label: `Hợp lệ (${stats.valid})` },
      { key: 'WARNING' as const, label: `Cảnh báo (${stats.warning})` },
      { key: 'ERROR' as const, label: `Lỗi (${stats.error})` }
    ],
    [stats.error, stats.total, stats.valid, stats.warning]
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
        content: 'Vui lòng chọn file Excel đúng định dạng .xlsx hoặc .xls'
      });
      return;
    }

    setSelectedFile(file);
    setImportResult(undefined);
    setWorkbookMessages([]);
    setCheckedAt('');
    showToast({
      type: TYPE_TOAST.SUCCESS,
      content: `Đã chọn ${file.name} (${formatUploadFileSize(file.size)})`
    });
  }, []);

  const onRemoveFile = useCallback(() => {
    setSelectedFile(undefined);
    setPreviewRows(getSamplePreview());
    setWorkbookMessages([]);
    setCheckedAt('');
    setImportResult(undefined);
  }, []);

  const onCheckData = useCallback(async () => {
    setCheckingData(true);
    setImportResult(undefined);

    if (!selectedFile) {
      const sample = buildPreviewRows(SAMPLE_WORKBOOK);
      setPreviewRows(sample.rows);
      setWorkbookMessages(['Đang hiển thị dữ liệu mẫu theo file Excel tham chiếu']);
      setCheckedAt(dayjs().format('HH:mm DD/MM/YYYY'));
      setCheckingData(false);
      return;
    }

    if (!isXlsxFile(selectedFile)) {
      setWorkbookMessages([
        'Chỉ hỗ trợ xem trước file .xlsx. File .xls sẽ được backend kiểm tra khi upload.'
      ]);
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

    if (stats.error) {
      showToast({
        type: TYPE_TOAST.ERROR,
        content: 'File còn dòng lỗi. Vui lòng kiểm tra lại trước khi nhập'
      });
      return;
    }

    if (!periodInfo.from || !periodInfo.to || !readingDate) {
      showToast({
        type: TYPE_TOAST.ERROR,
        content: 'Vui lòng chọn kỳ ghi chỉ số và ngày ghi chỉ số'
      });
      return;
    }

    setImporting(true);
    const response = await remoteMeterReadingServices.importRemoteMeterReadings({
      file: selectedFile,
      periodCode: periodStart,
      periodFrom: periodInfo.from,
      periodTo: periodInfo.to,
      readingDate,
      saveMode,
      note,
      typeInput: REMOTE_READING_TYPE_INPUT
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
  }, [
    note,
    periodInfo.from,
    periodInfo.to,
    periodStart,
    readingDate,
    saveMode,
    selectedFile,
    stats.error,
    stats.total
  ]);

  const onDownloadTemplate = useCallback(async () => {
    setDownloadingTemplate(true);
    const response = await remoteMeterReadingServices.downloadRemoteMeterReadingTemplate();
    setDownloadingTemplate(false);

    if (response?.data) {
      downloadByBlob(response.data, response.fileName || 'mau-nhap-chi-so-do-xa.xlsx');
      return;
    }

    openExternalTemplate();
    showToast({
      type: TYPE_TOAST.WARNING,
      content: 'Không tải được file mẫu từ hệ thống, đang mở file mẫu tham chiếu'
    });
  }, []);

  const onChangeTab = useCallback((tab: RemoteImportTabKey) => {
    setActiveTab(tab);
  }, []);

  const onChangePageSize = useCallback((value: number) => {
    setPageSize(value);
  }, []);

  const onChangePeriodStart = useCallback(
    (value: string) => {
      setPeriodStart(value);
      const nextStart = dayjs(value, 'MM/YYYY', true);
      const currentEnd = dayjs(periodEnd, 'MM/YYYY', true);

      if (nextStart.isValid() && currentEnd.isValid() && currentEnd.isBefore(nextStart, 'month')) {
        setPeriodEnd(value);
      }
    },
    [periodEnd]
  );

  const onChangePeriodEnd = useCallback((value: string) => {
    setPeriodEnd(value);
  }, []);

  return {
    activeTab,
    tabItems,
    keyword,
    selectedFile,
    displayFileName: selectedFile?.name || 'Chi_so_cong_to_07_2026.xlsx',
    selectedFileSize: selectedFile ? formatUploadFileSize(selectedFile.size) : '',
    previewRows,
    paginatedRows,
    filteredRows,
    stats,
    workbookMessages,
    periodStart,
    periodEnd,
    periodInfo,
    readingDate,
    saveMode,
    note,
    checkingData,
    importing,
    downloadingTemplate,
    importResult,
    checkedAt,
    pagination,
    currentPage,
    pageSize,
    onSelectFile,
    onRemoveFile,
    onCheckData,
    onImportData,
    onDownloadTemplate,
    onChangeTab,
    onChangeKeyword: setKeyword,
    onChangePageSize,
    onChangePeriodStart,
    onChangePeriodEnd,
    onChangeReadingDate: setReadingDate,
    onChangeSaveMode: setSaveMode,
    onChangeNote: setNote
  };
}
