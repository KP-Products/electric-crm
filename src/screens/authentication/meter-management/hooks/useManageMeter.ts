import { DEFAULT_PAGE_SIZE, FILE_EXT, K_SIZE_0, K_SIZE_1, MAX_PAGE_SIZE } from '@constant';
import { DELETE_METER, GET_METER_SEARCH_LIST } from '@redux-action-type/meter';
import { dispatch } from '@redux-common';
import { selectMeterLoadingList } from '@redux-selector/meter';
import { showDialog } from 'components/dialog';
import { TYPE_ACTION, TYPE_MESSAGE } from 'components/dialog/type';
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
import { FORMAT_DATE_API, FORMAT_DATE_TIME_DOWNLOAD } from 'utils/date';
import { useAppTranslation } from 'utils/i18n';
import useCustomerLookup from '../../manage-contract/hooks/useCustomerLookup';
import { escapeHtml as escapeExcelHtml } from '../../manage-contract/utils';
import {
  METER_TYPE,
  UNASSIGNED_METER_GROUP,
  getMeterRecordId,
  getMeterStatusLabel,
  getVoltageLevelLabel,
  isUnassignedMeter,
  isUnassignedMeterGroup,
  normalizeMeterType
} from '../utils/constant';
import { loadUnassignedMeters } from '../utils/loadUnassignedMeters';

export interface MeterFilterForm {
  meterCodeContains: string;
  customerId?: number;
  meterType: string;
  status: string;
  voltageLevel: string;
  installationDateFrom: string;
  installationDateTo: string;
  purchaseDateFrom: string;
  purchaseDateTo: string;
}

export interface MeterChildListState {
  items: Meter[];
  total: number;
  currentPage: number;
  loading: boolean;
  loaded: boolean;
}

const formatDate = (value?: string) => {
  if (!value) return '-';
  const date = moment(value);
  return date.isValid() ? date.format('DD/MM/YYYY') : '-';
};

const hasClientOnlyFilters = (filter: MeterFilterForm) =>
  Boolean(
    filter.voltageLevel ||
      filter.installationDateFrom ||
      filter.installationDateTo ||
      filter.purchaseDateFrom ||
      filter.purchaseDateTo
  );

const getEmptyChildListState = (currentPage = K_SIZE_1): MeterChildListState => ({
  items: [],
  total: K_SIZE_0,
  currentPage,
  loading: false,
  loaded: false
});

const getMeterErrorMessage = (error: ErrorBase | undefined, fallback: string) =>
  error?.businessErrorMessage || error?.systemErrorMessage || fallback;

const parseMeterDate = (value?: string) => {
  if (!value) return undefined;
  const parsedDate = moment(value, [FORMAT_DATE_API, 'YYYY-MM-DD', 'DD/MM/YYYY'], true);
  if (parsedDate.isValid()) return parsedDate;
  const fallbackDate = moment(value);
  return fallbackDate.isValid() ? fallbackDate : undefined;
};

const applyClientOnlyFilters = (meters: Meter[], filter: MeterFilterForm) => {
  const installationFromDate = parseMeterDate(filter.installationDateFrom)?.startOf('day');
  const installationToDate = parseMeterDate(filter.installationDateTo)?.endOf('day');
  const purchaseFromDate = parseMeterDate(filter.purchaseDateFrom)?.startOf('day');
  const purchaseToDate = parseMeterDate(filter.purchaseDateTo)?.endOf('day');

  return meters.filter((meter) => {
    if (filter.voltageLevel && meter.voltageLevel !== filter.voltageLevel) return false;

    const installationDate = parseMeterDate(meter.installationDate);
    if (
      installationFromDate &&
      (!installationDate || installationDate.isBefore(installationFromDate))
    ) {
      return false;
    }
    if (installationToDate && (!installationDate || installationDate.isAfter(installationToDate))) {
      return false;
    }

    const purchaseDate = parseMeterDate(meter.purchaseDate);
    if (purchaseFromDate && (!purchaseDate || purchaseDate.isBefore(purchaseFromDate))) {
      return false;
    }
    if (purchaseToDate && (!purchaseDate || purchaseDate.isAfter(purchaseToDate))) return false;

    return true;
  });
};

const getMeterDisplayValue = (meter: Meter, key: string) => {
  switch (key) {
    case 'status':
      return getMeterStatusLabel(meter.status);
    case 'purchaseDate':
      return formatDate(meter.purchaseDate);
    case 'installationDate':
      return formatDate(meter.installationDate);
    case 'voltageLevel':
      return getVoltageLevelLabel(meter.voltageLevel);
    case 'meterType':
      return normalizeMeterType(meter.meterType) === METER_TYPE.FEEDER ? 'Lộ tổng' : 'Khách hàng';
    case 'customerId':
      // BE join sẵn khách hàng qua hợp đồng mua bán điện; hiển thị "mã - tên" theo yêu cầu 04/08.
      return (
        [meter.customerCode, meter.customerName].filter(Boolean).join(' - ') ||
        meter.customerId ||
        '-'
      );
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
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);
  const [childMeterMap, setChildMeterMap] = useState<Record<string, MeterChildListState>>({});
  const unassignedMeterCache = useRef<Meter[]>();
  const childRequestVersion = useRef(0);

  const defaultFilter: MeterFilterForm = useMemo(
    () => ({
      meterCodeContains: '',
      customerId: undefined,
      meterType: '',
      status: '',
      voltageLevel: '',
      installationDateFrom: '',
      installationDateTo: '',
      purchaseDateFrom: '',
      purchaseDateTo: ''
    }),
    []
  );
  const [filterDraft, setFilterDraft] = useState<MeterFilterForm>(defaultFilter);
  const [filterApplied, setFilterApplied] = useState<MeterFilterForm>(defaultFilter);
  const [currentPage, setCurrentPage] = useState<number>(K_SIZE_1);

  const resetExpandedRows = useCallback(() => {
    childRequestVersion.current += 1;
    unassignedMeterCache.current = undefined;
    setExpandedRowKeys([]);
    setChildMeterMap({});
  }, []);

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

  const buildRootSearchBody = useCallback(
    (filter: MeterFilterForm, page: number, size = DEFAULT_PAGE_SIZE): GetListMeterReq => {
      const normalize = (value?: string) => {
        const normalized = value?.trim();
        return normalized || undefined;
      };

      return {
        page: page - K_SIZE_1,
        size,
        meterCodeContains: normalize(filter.meterCodeContains),
        customerId: filter.customerId,
        meterType: METER_TYPE.FEEDER,
        status: normalize(filter.status),
        voltageLevel: normalize(filter.voltageLevel),
        installationDateFrom: normalize(filter.installationDateFrom),
        installationDateTo: normalize(filter.installationDateTo),
        purchaseDateFrom: normalize(filter.purchaseDateFrom),
        purchaseDateTo: normalize(filter.purchaseDateTo)
      };
    },
    []
  );

  const buildChildSearchBody = useCallback(
    (
      parentId: string,
      filter: MeterFilterForm,
      page: number,
      size = DEFAULT_PAGE_SIZE
    ): GetListMeterReq => {
      const normalize = (value?: string) => {
        const normalized = value?.trim();
        return normalized || undefined;
      };
      const meterType = normalize(filter.meterType);

      return {
        page: page - K_SIZE_1,
        size,
        parentId: parentId === UNASSIGNED_METER_GROUP.meterId ? undefined : parentId,
        meterCodeContains: normalize(filter.meterCodeContains),
        customerId: filter.customerId,
        meterType: meterType && meterType !== METER_TYPE.FEEDER ? meterType : undefined,
        status: normalize(filter.status),
        voltageLevel: normalize(filter.voltageLevel),
        installationDateFrom: normalize(filter.installationDateFrom),
        installationDateTo: normalize(filter.installationDateTo),
        purchaseDateFrom: normalize(filter.purchaseDateFrom),
        purchaseDateTo: normalize(filter.purchaseDateTo)
      };
    },
    []
  );

  const fetchMeterList = useCallback(
    (page: number) => {
      const shouldClientFilter = hasClientOnlyFilters(filterApplied);
      dispatch({
        type: GET_METER_SEARCH_LIST,
        payload: {
          body: buildRootSearchBody(
            filterApplied,
            shouldClientFilter ? K_SIZE_1 : page,
            shouldClientFilter ? MAX_PAGE_SIZE : DEFAULT_PAGE_SIZE
          ),
          onSuccess: (res: GetListMeterRes) => {
            const responseRows = (res?.data?.items || [])
              .map(normalizeMeterSearchItem)
              .filter(Boolean) as Meter[];
            const filteredRows = shouldClientFilter
              ? applyClientOnlyFilters(responseRows, filterApplied)
              : responseRows;
            const pageStart = (page - K_SIZE_1) * DEFAULT_PAGE_SIZE;
            const pageEnd = pageStart + DEFAULT_PAGE_SIZE;

            setMeterList(
              shouldClientFilter ? filteredRows.slice(pageStart, pageEnd) : filteredRows
            );
            setTotal(shouldClientFilter ? filteredRows.length : res?.data?.total || K_SIZE_0);
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
    [buildRootSearchBody, filterApplied]
  );

  useEffect(() => {
    fetchMeterList(currentPage);
  }, [currentPage, fetchMeterList]);

  useEffect(
    () => () => {
      childRequestVersion.current += 1;
    },
    []
  );

  const pagination = useMemo(
    () => ({
      current: currentPage,
      total,
      pageSize: DEFAULT_PAGE_SIZE,
      onChange: (page: number) => {
        resetExpandedRows();
        setCurrentPage(page);
      },
      showSizeChanger: false
    }),
    [currentPage, resetExpandedRows, total]
  );

  const onChangeFilter = useCallback(
    (key: keyof MeterFilterForm, value: MeterFilterForm[keyof MeterFilterForm]) => {
      setFilterDraft((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const onApplyFilter = useCallback(() => {
    resetExpandedRows();
    setFilterApplied(filterDraft);
    setCurrentPage(K_SIZE_1);
  }, [filterDraft, resetExpandedRows]);

  const onResetFilter = useCallback(
    (key?: keyof MeterFilterForm) => {
      if (key) {
        setFilterDraft((prev) => ({ ...prev, [key]: defaultFilter[key] }));
        setFilterApplied((prev) => ({ ...prev, [key]: '' }));
      } else {
        setFilterDraft(defaultFilter);
        setFilterApplied(defaultFilter);
      }
      resetExpandedRows();
      setCurrentPage(K_SIZE_1);
    },
    [defaultFilter, resetExpandedRows]
  );

  const fetchChildMeters = useCallback(
    async (parentId: string, page = K_SIZE_1) => {
      if (!parentId) return;

      if (filterApplied.meterType === METER_TYPE.FEEDER) {
        setChildMeterMap((prev) => ({
          ...prev,
          [parentId]: { ...getEmptyChildListState(page), loaded: true }
        }));
        return;
      }

      const shouldClientFilter = hasClientOnlyFilters(filterApplied);
      const requestVersion = childRequestVersion.current;
      const isUnassignedGroup = parentId === UNASSIGNED_METER_GROUP.meterId;

      setChildMeterMap((prev) => ({
        ...prev,
        [parentId]: {
          ...(prev[parentId] || getEmptyChildListState(page)),
          currentPage: page,
          loading: true
        }
      }));

      if (isUnassignedGroup) {
        try {
          let rows = unassignedMeterCache.current;
          if (!rows) {
            const unassignedRows = await loadUnassignedMeters(
              (searchPage) =>
                meterServices.getMeterSearchList(
                  buildChildSearchBody(parentId, filterApplied, searchPage)
                ),
              () => requestVersion === childRequestVersion.current
            );
            if (!unassignedRows) return;
            rows = applyClientOnlyFilters(unassignedRows, filterApplied);
            unassignedMeterCache.current = rows;
          }

          const cachedRows = rows;
          const pageStart = (page - K_SIZE_1) * DEFAULT_PAGE_SIZE;
          setChildMeterMap((prev) => ({
            ...prev,
            [parentId]: {
              items: cachedRows.slice(pageStart, pageStart + DEFAULT_PAGE_SIZE),
              total: cachedRows.length,
              currentPage: page,
              loading: false,
              loaded: true
            }
          }));
        } catch (error) {
          if (requestVersion !== childRequestVersion.current) return;
          setChildMeterMap((prev) => ({
            ...prev,
            [parentId]: getEmptyChildListState(page)
          }));
          showToast({
            type: TYPE_TOAST.ERROR,
            content: getMeterErrorMessage(
              error as ErrorBase | undefined,
              'Tải danh sách công tơ không thuộc lộ thất bại'
            )
          });
        }
        return;
      }

      const response = await meterServices.getMeterSearchList(
        buildChildSearchBody(
          parentId,
          filterApplied,
          shouldClientFilter ? K_SIZE_1 : page,
          shouldClientFilter ? MAX_PAGE_SIZE : DEFAULT_PAGE_SIZE
        )
      );
      if (requestVersion !== childRequestVersion.current) return;

      if (!response || !response.data) {
        setChildMeterMap((prev) => ({
          ...prev,
          [parentId]: {
            ...(prev[parentId] || getEmptyChildListState(page)),
            currentPage: page,
            loading: false,
            loaded: true
          }
        }));
        showToast({
          type: TYPE_TOAST.ERROR,
          content:
            response?.businessErrorMessage ||
            response?.systemErrorMessage ||
            'Tải danh sách công tơ con thất bại'
        });
        return;
      }

      const responseRows = (response.data.items || [])
        .map(normalizeMeterSearchItem)
        .filter(Boolean) as Meter[];
      const filteredRows = shouldClientFilter
        ? applyClientOnlyFilters(responseRows, filterApplied)
        : responseRows;
      const pageStart = (page - K_SIZE_1) * DEFAULT_PAGE_SIZE;
      const pageEnd = pageStart + DEFAULT_PAGE_SIZE;

      setChildMeterMap((prev) => ({
        ...prev,
        [parentId]: {
          items: shouldClientFilter ? filteredRows.slice(pageStart, pageEnd) : filteredRows,
          total: shouldClientFilter ? filteredRows.length : response.data?.total || K_SIZE_0,
          currentPage: page,
          loading: false,
          loaded: true
        }
      }));
    },
    [buildChildSearchBody, filterApplied]
  );

  const onExpandMeterRow = useCallback(
    (expanded: boolean, record: Meter) => {
      const parentId = getMeterRecordId(record);
      if (!parentId) return;

      setExpandedRowKeys((prev) =>
        expanded ? Array.from(new Set([...prev, parentId])) : prev.filter((key) => key !== parentId)
      );

      if (expanded && !childMeterMap[parentId]?.loaded && !childMeterMap[parentId]?.loading) {
        void fetchChildMeters(parentId, K_SIZE_1);
      }
    },
    [childMeterMap, fetchChildMeters]
  );

  const refreshRootAfterDelete = useCallback(() => {
    resetExpandedRows();

    if (meterList.length === K_SIZE_1 && currentPage > K_SIZE_1) {
      setCurrentPage(currentPage - K_SIZE_1);
      return;
    }

    fetchMeterList(currentPage);
  }, [currentPage, fetchMeterList, meterList.length, resetExpandedRows]);

  const refreshChildAfterDelete = useCallback(
    (record: Meter) => {
      const parentId = isUnassignedMeter(record) ? UNASSIGNED_METER_GROUP.meterId : record.parentId;
      if (parentId === UNASSIGNED_METER_GROUP.meterId) {
        unassignedMeterCache.current = undefined;
      }
      if (!parentId || !childMeterMap[parentId]) {
        refreshRootAfterDelete();
        return;
      }

      const childState = childMeterMap[parentId];
      const nextPage =
        childState.items.length === K_SIZE_1 && childState.currentPage > K_SIZE_1
          ? childState.currentPage - K_SIZE_1
          : childState.currentPage;

      void fetchChildMeters(parentId, nextPage);
    },
    [childMeterMap, fetchChildMeters, refreshRootAfterDelete]
  );

  const onDeleteMeter = useCallback(
    (record: Meter) => {
      if (isUnassignedMeterGroup(record)) return;
      const meterId = getMeterRecordId(record);
      if (!meterId) {
        showToast({
          type: TYPE_TOAST.ERROR,
          content: 'Không tìm thấy ID công tơ để xoá'
        });
        return;
      }

      showDialog({
        title: t('common:delete_confirm'),
        content: `Bạn có chắc chắn xoá công tơ ${record.meterCode || meterId}?`,
        type: TYPE_MESSAGE.ALERT,
        actions: [
          {
            title: t('common:agree'),
            type: TYPE_ACTION.PRIMARY,
            onPress: () => {
              dispatch({
                type: DELETE_METER,
                payload: {
                  body: { meterId },
                  onSuccess: () => {
                    if (record.parentId || isUnassignedMeter(record)) {
                      refreshChildAfterDelete(record);
                    } else {
                      refreshRootAfterDelete();
                    }

                    showToast({
                      type: TYPE_TOAST.SUCCESS,
                      content: 'Xoá công tơ thành công'
                    });
                  },
                  onFailed: (error?: ErrorBase) => {
                    showToast({
                      type: TYPE_TOAST.ERROR,
                      content: getMeterErrorMessage(error, 'Xoá công tơ thất bại')
                    });
                  }
                }
              });
            }
          },
          {
            title: t('common:cancel'),
            type: TYPE_ACTION.SECONDARY
          }
        ]
      });
    },
    [refreshChildAfterDelete, refreshRootAfterDelete, t]
  );

  const exportRowsToExcel = useCallback((rows: Meter[]) => {
    const columns = [
      ['meterCode', 'Mã công tơ'],
      ['customerId', 'Mã khách hàng'],
      ['meterType', 'Loại công tơ'],
      ['parentId', 'Công tơ cha / Lộ tổng'],
      ['voltageLevel', 'Cấp điện áp'],
      ['multiplier', 'Hệ số nhân'],
      ['initialReading', 'Chỉ số đầu'],
      ['purchaseDate', 'Ngày mua'],
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
      ...buildRootSearchBody(filterApplied, K_SIZE_1, MAX_PAGE_SIZE)
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
      applyClientOnlyFilters(
        (response.data.items || []).map(normalizeMeterSearchItem).filter(Boolean) as Meter[],
        filterApplied
      )
    );
    showToast({ type: TYPE_TOAST.SUCCESS, content: 'Xuất Excel danh sách công tơ thành công' });
  }, [buildRootSearchBody, exportRowsToExcel, filterApplied]);

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
    expandedRowKeys,
    childMeterMap,
    onResetFilter,
    meterList,
    total,
    onExpandMeterRow,
    onDeleteMeter,
    fetchChildMeters,
    onExport,
    onImport
  };
}
