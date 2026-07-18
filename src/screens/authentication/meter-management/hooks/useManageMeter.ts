import { DEFAULT_PAGE_SIZE, FILE_EXT, K_SIZE_0, K_SIZE_1, MAX_PAGE_SIZE } from '@constant';
import { GET_METER_SEARCH_LIST } from '@redux-action-type/meter';
import { dispatch } from '@redux-common';
import { selectMeterLoadingList } from '@redux-selector/meter';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import { ErrorBase } from 'model/common';
import { GetListMeterReq, GetListMeterRes, Meter, normalizeMeterSearchItem } from 'model/meter';
import moment from 'moment';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import meterServices from 'services/meter-services';
import { DebugUtils } from 'utils/debug-utils';
import { FORMAT_DATE_TIME_DOWNLOAD } from 'utils/date';
import { useAppTranslation } from 'utils/i18n';
import {
  getInspectionStatus,
  getMeterStatusLabel,
  getMeterTypeLabel,
  getUsagePurposeLabel,
  getVoltageTypeLabel,
  INSPECTION_STATUS_LABEL_MAP
} from '../utils/constant';

export interface MeterFilterForm {
  meterCodeContains: string;
  customerId: string;
  voltageType: string;
  status: string;
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const formatDate = (value?: string) => {
  if (!value) return '-';
  const date = moment(value);
  return date.isValid() ? date.format('DD/MM/YYYY') : '-';
};

const getMeterDisplayValue = (meter: Meter, key: string) => {
  switch (key) {
    case 'status':
      return getMeterStatusLabel(meter.status);
    case 'meterType':
      return getMeterTypeLabel(meter.meterType);
    case 'purchaseDate':
      return formatDate(meter.purchaseDate);
    case 'installationDate':
      return formatDate(meter.installationDate);
    case 'inspectionDate':
      return formatDate(meter.inspectionDate);
    case 'inspectionExpiryDate':
      return formatDate(meter.inspectionExpiryDate);
    case 'inspectionStatus':
      return INSPECTION_STATUS_LABEL_MAP[getInspectionStatus(meter.inspectionExpiryDate)];
    case 'voltageType':
      return getVoltageTypeLabel(meter.voltageType || meter.voltageLevel);
    case 'customerId':
      return meter.customerName || meter.customerId || '-';
    case 'feeder':
      return meter.feederName || meter.feederId || '-';
    case 'usagePurpose':
      return getUsagePurposeLabel(meter.usagePurpose);
    case 'multiplier':
      return meter.multiplier !== undefined && meter.multiplier !== null
        ? String(meter.multiplier)
        : '-';
    default:
      return String((meter as any)[key] || '-');
  }
};

export default function useManageMeter() {
  const { t } = useAppTranslation();
  const router = useRouter();
  const loadingMeterList = useSelector(selectMeterLoadingList);
  const [meterList, setMeterList] = useState<Meter[]>([]);
  const [total, setTotal] = useState<number>(K_SIZE_0);
  const [exportLoading, setExportLoading] = useState<boolean>(false);

  const defaultFilter: MeterFilterForm = useMemo(
    () => ({
      meterCodeContains: '',
      customerId: '',
      voltageType: '',
      status: ''
    }),
    []
  );
  const [filterApplied, setFilterApplied] = useState<MeterFilterForm>(defaultFilter);
  const [currentPage, setCurrentPage] = useState<number>(K_SIZE_1);

  const filterDrawerRef = useRef<{ open: (filter: MeterFilterForm) => void }>(null);

  const buildSearchBody = useCallback(
    (filter: MeterFilterForm, page: number, size = DEFAULT_PAGE_SIZE): GetListMeterReq => {
      const normalizedFilter = Object.fromEntries(
        Object.entries(filter)
          .map(([key, value]) => [key, value.trim()])
          .filter(([, value]) => Boolean(value))
      );

      return {
        page: page - K_SIZE_1,
        size,
        ...normalizedFilter
      };
    },
    []
  );

  const fetchMeterList = useCallback(
    (page: number) => {
      dispatch({
        type: GET_METER_SEARCH_LIST,
        payload: {
          body: buildSearchBody(filterApplied, page),
          onSuccess: (res: GetListMeterRes) => {
            setMeterList(
              (res?.data?.items || []).map(normalizeMeterSearchItem).filter(Boolean) as Meter[]
            );
            setTotal(res?.data?.total || K_SIZE_0);
            DebugUtils.logS(['METER LIST data', res]);
          },
          onFailed: (error?: ErrorBase) => {
            setMeterList([]);
            setTotal(K_SIZE_0);
            DebugUtils.logS(['METER LIST error', error]);
            showToast({
              type: TYPE_TOAST.ERROR,
              content:
                error?.businessErrorMessage ||
                error?.systemErrorMessage ||
                'Tải danh sách công tơ thất bại'
            });
          }
        }
      });
    },
    [buildSearchBody, filterApplied]
  );

  useEffect(() => {
    fetchMeterList(currentPage);
  }, [currentPage, fetchMeterList]);

  const pagination = useMemo(
    () => ({
      current: currentPage,
      total,
      pageSize: DEFAULT_PAGE_SIZE,
      onChange: (page: number) => setCurrentPage(page),
      showSizeChanger: false
    }),
    [currentPage, total]
  );

  const onApplyFilter = useCallback((data: MeterFilterForm) => {
    setFilterApplied(data);
    setCurrentPage(K_SIZE_1);
  }, []);

  const onResetFilter = useCallback(
    (key?: keyof MeterFilterForm) => {
      if (key) {
        setFilterApplied((prev) => ({ ...prev, [key]: '' }));
      } else {
        setFilterApplied(defaultFilter);
      }
      setCurrentPage(K_SIZE_1);
    },
    [defaultFilter]
  );

  const exportRowsToExcel = useCallback((rows: Meter[]) => {
    const columns = [
      ['meterCode', 'Số công tơ'],
      ['status', 'Trạng thái'],
      ['meterType', 'Loại công tơ'],
      ['manufacturer', 'Hãng sản xuất'],
      ['purchaseDate', 'Ngày mua'],
      ['installationDate', 'Ngày lắp'],
      ['inspectionDate', 'Ngày kiểm định'],
      ['inspectionExpiryDate', 'Thời hạn kiểm định'],
      ['inspectionStatus', 'Cảnh báo kiểm định'],
      ['voltageType', 'Cấp điện áp'],
      ['customerId', 'Khách hàng'],
      ['feeder', 'Lộ điện'],
      ['usagePurpose', 'Mục đích sử dụng'],
      ['multiplier', 'Hệ số nhân']
    ];
    const headerHtml = columns.map(([, label]) => `<th>${escapeHtml(label)}</th>`).join('');
    const bodyHtml = rows
      .map(
        (row) =>
          `<tr>${columns
            .map(([key]) => `<td>${escapeHtml(getMeterDisplayValue(row, key))}</td>`)
            .join('')}</tr>`
      )
      .join('');
    const html = `<html><head><meta charset="UTF-8" /></head><body><table border="1"><thead><tr>${headerHtml}</tr></thead><tbody>${bodyHtml}</tbody></table></body></html>`;
    const blob = new Blob(['\ufeff', html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `METER_${moment().format(FORMAT_DATE_TIME_DOWNLOAD)}.${FILE_EXT.EXCEL2}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }, []);

  const onExport = useCallback(async () => {
    setExportLoading(true);
    const response = await meterServices.getMeterSearchList({
      ...buildSearchBody(filterApplied, K_SIZE_1, MAX_PAGE_SIZE)
    });
    setExportLoading(false);

    if (!response || !response.data) {
      showToast({
        type: TYPE_TOAST.ERROR,
        content:
          response?.businessErrorMessage ||
          response?.systemErrorMessage ||
          'Xuất Excel danh sách công tơ thất bại'
      });
      return;
    }

    exportRowsToExcel(
      (response.data.items || []).map(normalizeMeterSearchItem).filter(Boolean) as Meter[]
    );
    showToast({ type: TYPE_TOAST.SUCCESS, content: 'Xuất Excel danh sách công tơ thành công' });
  }, [buildSearchBody, exportRowsToExcel, filterApplied]);

  return {
    t,
    router,
    onApplyFilter,
    defaultFilter,
    filterApplied,
    loadingMeterList,
    exportLoading,
    currentPage,
    pagination,
    onResetFilter,
    filterDrawerRef,
    meterList,
    total,
    onExport
  };
}
