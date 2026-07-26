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
import useCustomerLookup from '../../manage-contract/hooks/useCustomerLookup';
import { escapeHtml as escapeExcelHtml } from '../../manage-contract/utils';
import { getMeterStatusLabel, getVoltageLevelLabel, getVoltageTypeLabel } from '../utils/constant';

export interface MeterFilterForm {
  meterCodeContains: string;
  customerId: string;
  status: string;
  voltageType: string;
}

const formatDate = (value?: string) => {
  if (!value) return '-';
  const date = moment(value);
  return date.isValid() ? date.format('DD/MM/YYYY') : '-';
};

const getMeterDisplayValue = (meter: Meter, key: string) => {
  switch (key) {
    case 'status':
      return getMeterStatusLabel(meter.status);
    case 'installationDate':
      return formatDate(meter.installationDate);
    case 'voltageType':
      return getVoltageTypeLabel(meter.voltageType);
    case 'voltageLevel':
      return getVoltageLevelLabel(meter.voltageLevel);
    case 'customerId':
      return meter.customerName || meter.customerId || '-';
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
      status: '',
      voltageType: ''
    }),
    []
  );
  const [filterDraft, setFilterDraft] = useState<MeterFilterForm>(defaultFilter);
  const [filterApplied, setFilterApplied] = useState<MeterFilterForm>(defaultFilter);
  const [currentPage, setCurrentPage] = useState<number>(K_SIZE_1);

  const filterDrawerRef = useRef<{ open: (filter: MeterFilterForm) => void }>(null);

  const pinnedCustomerIds = useMemo(
    () => [
      filterDraft.customerId,
      filterApplied.customerId,
      ...meterList.map((meter) => meter.customerId)
    ],
    [filterApplied.customerId, filterDraft.customerId, meterList]
  );

  const { customerOptions, getCustomerDisplay, onOpenCustomerDropdown, customerDropdownRender } =
    useCustomerLookup({
      autoLoad: false,
      pinnedIds: pinnedCustomerIds,
      showErrorToast: true
    });

  const buildSearchBody = useCallback(
    (filter: MeterFilterForm, page: number, size = DEFAULT_PAGE_SIZE): GetListMeterReq => {
      const normalize = (value?: string) => {
        const normalized = value?.trim();
        return normalized || undefined;
      };

      return {
        page: page - K_SIZE_1,
        size,
        meterCodeContains: normalize(filter.meterCodeContains),
        customerId: normalize(filter.customerId),
        voltageType: normalize(filter.voltageType),
        status: normalize(filter.status)
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

  const onChangeFilter = useCallback(
    (key: keyof MeterFilterForm, value: MeterFilterForm[keyof MeterFilterForm]) => {
      setFilterDraft((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const onApplyFilter = useCallback(() => {
    setFilterApplied(filterDraft);
    setCurrentPage(K_SIZE_1);
  }, [filterDraft]);

  const onResetFilter = useCallback(
    (key?: keyof MeterFilterForm) => {
      if (key) {
        setFilterDraft((prev) => ({ ...prev, [key]: defaultFilter[key] }));
        setFilterApplied((prev) => ({ ...prev, [key]: '' }));
      } else {
        setFilterDraft(defaultFilter);
        setFilterApplied(defaultFilter);
      }
      setCurrentPage(K_SIZE_1);
    },
    [defaultFilter]
  );

  const exportRowsToExcel = useCallback((rows: Meter[]) => {
    const columns = [
      ['meterCode', 'Mã công tơ'],
      ['customerId', 'Mã khách hàng'],
      ['voltageLevel', 'Cấp điện áp'],
      ['voltageType', 'Kiểu điện áp'],
      ['multiplier', 'Hệ số nhân'],
      ['initialReading', 'Chỉ số đầu'],
      ['installationDate', 'Ngày lắp đặt'],
      ['status', 'Trạng thái']
    ];
    const headerHtml = columns.map(([, label]) => `<th>${escapeExcelHtml(label)}</th>`).join('');
    const bodyHtml = rows
      .map(
        (row) =>
          `<tr>${columns
            .map(([key]) => `<td>${escapeExcelHtml(getMeterDisplayValue(row, key))}</td>`)
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

  const onImport = useCallback(() => {
    showToast({
      type: TYPE_TOAST.INFO,
      content: 'Chức năng import Excel công tơ đang được phát triển'
    });
  }, []);

  return {
    t,
    router,
    onChangeFilter,
    onApplyFilter,
    defaultFilter,
    filterDraft,
    filterApplied,
    customerOptions,
    getCustomerDisplay,
    onOpenCustomerDropdown,
    customerDropdownRender,
    loadingMeterList,
    exportLoading,
    currentPage,
    pagination,
    onResetFilter,
    filterDrawerRef,
    meterList,
    total,
    onExport,
    onImport
  };
}
