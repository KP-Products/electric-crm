import { CONSTANTS, DEFAULT_PAGE_SIZE, K_SIZE_0, K_SIZE_1 } from '@constant';
import { zodResolver } from '@hookform/resolvers/zod';
import { showDialog } from 'components/dialog';
import { TYPE_ACTION, TYPE_MESSAGE } from 'components/dialog/type';
import type { AppSelectOption } from 'components/select';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import { ErrorBase } from 'model/common';
import { Employee } from 'model/employee';
import { PpeItem } from 'model/ppe-item';
import { PpeItemHistory } from 'model/ppe-item-history';
import { debounce } from 'lodash';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import employeeServices from 'services/employee-services';
import ppeItemHistoryServices from 'services/ppe-item-history-services';
import ppeItemServices from 'services/ppe-item-services';
import { useAppTranslation } from 'utils/i18n';
import { isFormattedIntegerInput, parseFormattedIntegerNumber } from 'utils/number-input';
import { z } from 'zod';
import {
  buildCreatePpeItemHistoryBody,
  buildEmployeeOptions,
  buildPpeItemHistoryFormValues,
  buildPpeItemHistorySearchBody,
  buildPpeItemOptions,
  buildUpdatePpeItemHistoryBody,
  DEFAULT_PPE_ITEM_HISTORY_FILTER,
  DEFAULT_PPE_ITEM_HISTORY_FORM_VALUES,
  getEmployeeLabel,
  getPpeItemHistoryErrorMessage,
  getPpeItemLabel
} from './utils';

const optionalString = z.preprocess(
  (value) => (value === null || value === undefined ? '' : value),
  z.string().trim()
);

const requiredSelect = (message: string) =>
  z.string().trim().min(K_SIZE_1, {
    message
  });

const ppeItemHistorySchema = z.object({
  ppeItemId: requiredSelect('Vui lòng chọn thiết bị'),
  employeeId: requiredSelect('Vui lòng chọn nhân viên nhận'),
  exportDate: optionalString,
  quantity: z
    .string()
    .trim()
    .refine(
      (value) =>
        !value ||
        (isFormattedIntegerInput(value) &&
          (parseFormattedIntegerNumber(value) ?? K_SIZE_0) > K_SIZE_0),
      {
        message: 'Số lượng phải là số nguyên dương'
      }
    ),
  note: optionalString,
  type: optionalString,
  exportEmployeeId: requiredSelect('Vui lòng chọn nhân viên bàn giao')
});

export type PpeItemHistoryForm = z.infer<typeof ppeItemHistorySchema>;

export interface PpeItemHistoryFilterForm {
  ppeItemId: string;
  employeeId: string;
  exportDate: string;
  type: string;
  exportEmployeeId: string;
}

const hasApiError = (response?: ErrorBase | null) =>
  !response ||
  Boolean(response.businessErrorMessage || response.systemErrorMessage || response.detailMessage);

const getHistoryPpeItemLabel = (history: PpeItemHistory) => {
  const name = history.itemName || history.itemCode || String(history.ppeItemId || '');
  return history.itemCode ? `${history.itemCode} - ${name}` : name;
};

export default function usePpeItemHistory() {
  const { t } = useAppTranslation();
  const [historyList, setHistoryList] = useState<PpeItemHistory[]>([]);
  const [total, setTotal] = useState<number>(K_SIZE_0);
  const [listLoading, setListLoading] = useState<boolean>(false);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(K_SIZE_1);
  const [filter, setFilter] = useState<PpeItemHistoryFilterForm>(DEFAULT_PPE_ITEM_HISTORY_FILTER);
  const [filterApplied, setFilterApplied] = useState<PpeItemHistoryFilterForm>(
    DEFAULT_PPE_ITEM_HISTORY_FILTER
  );
  const [ppeItemLabelMap, setPpeItemLabelMap] = useState<Record<string, string>>({});
  const [employeeLabelMap, setEmployeeLabelMap] = useState<Record<string, string>>({});
  const [searchedPpeItemOptions, setSearchedPpeItemOptions] = useState<AppSelectOption[]>([]);
  const [searchedEmployeeOptions, setSearchedEmployeeOptions] = useState<AppSelectOption[]>([]);
  const [ppeItemSearch, setPpeItemSearch] = useState<string>('');
  const [employeeSearch, setEmployeeSearch] = useState<string>('');
  const [ppeItemOptionsLoading, setPpeItemOptionsLoading] = useState<boolean>(false);
  const [employeeOptionsLoading, setEmployeeOptionsLoading] = useState<boolean>(false);
  const [openForm, setOpenForm] = useState<boolean>(false);
  const [selectedHistory, setSelectedHistory] = useState<PpeItemHistory>();
  const submittingRef = useRef<boolean>(false);
  const ppeItemSearchRequestRef = useRef<number>(K_SIZE_0);
  const employeeSearchRequestRef = useRef<number>(K_SIZE_0);

  const form = useForm<PpeItemHistoryForm>({
    mode: 'onTouched',
    defaultValues: DEFAULT_PPE_ITEM_HISTORY_FORM_VALUES,
    resolver: zodResolver(ppeItemHistorySchema)
  });
  const watchedPpeItemId = form.watch('ppeItemId');
  const watchedEmployeeId = form.watch('employeeId');
  const watchedExportEmployeeId = form.watch('exportEmployeeId');

  const upsertPpeItemLabels = useCallback((items: PpeItem[]) => {
    setPpeItemLabelMap((prev) => {
      const next = { ...prev };
      let hasChange = false;

      items.forEach((item) => {
        if (item.id === undefined || item.id === null) return;
        const key = String(item.id);
        const label = getPpeItemLabel(item);
        if (next[key] === label) return;
        next[key] = label;
        hasChange = true;
      });

      return hasChange ? next : prev;
    });
  }, []);

  const upsertEmployeeLabels = useCallback((employees: Employee[]) => {
    setEmployeeLabelMap((prev) => {
      const next = { ...prev };
      let hasChange = false;

      employees.forEach((employee) => {
        if (employee.id === undefined || employee.id === null) return;
        const key = String(employee.id);
        const label = getEmployeeLabel(employee);
        if (next[key] === label) return;
        next[key] = label;
        hasChange = true;
      });

      return hasChange ? next : prev;
    });
  }, []);

  const upsertHistoryLabels = useCallback((histories: PpeItemHistory[]) => {
    setPpeItemLabelMap((prev) => {
      const next = { ...prev };
      let hasChange = false;

      histories.forEach((history) => {
        if (history.ppeItemId === undefined || history.ppeItemId === null) return;
        const key = String(history.ppeItemId);
        const label = getHistoryPpeItemLabel(history);
        if (!label || next[key] === label) return;
        next[key] = label;
        hasChange = true;
      });

      return hasChange ? next : prev;
    });

    setEmployeeLabelMap((prev) => {
      const next = { ...prev };
      let hasChange = false;

      histories.forEach((history) => {
        if (
          history.employeeId !== undefined &&
          history.employeeId !== null &&
          history.employeeName
        ) {
          const key = String(history.employeeId);
          if (next[key] !== history.employeeName) {
            next[key] = history.employeeName;
            hasChange = true;
          }
        }
        if (
          history.exportEmployeeId !== undefined &&
          history.exportEmployeeId !== null &&
          history.exportEmployeeName
        ) {
          const key = String(history.exportEmployeeId);
          if (next[key] !== history.exportEmployeeName) {
            next[key] = history.exportEmployeeName;
            hasChange = true;
          }
        }
      });

      return hasChange ? next : prev;
    });
  }, []);

  const ppeItemOptions = useMemo<AppSelectOption[]>(() => {
    const optionMap = new Map<string, AppSelectOption>();

    searchedPpeItemOptions.forEach((option) => optionMap.set(String(option.value), option));

    const addKnownPpeItemOption = (ppeItemId?: number | string) => {
      if (ppeItemId === undefined || ppeItemId === null || ppeItemId === '') return;
      const key = String(ppeItemId);
      const label = ppeItemLabelMap[key];
      if (!label || optionMap.has(key)) return;
      optionMap.set(key, { value: key, label });
    };

    historyList.forEach((history) => addKnownPpeItemOption(history.ppeItemId));
    addKnownPpeItemOption(filter.ppeItemId);
    addKnownPpeItemOption(selectedHistory?.ppeItemId);
    addKnownPpeItemOption(watchedPpeItemId);

    return Array.from(optionMap.values());
  }, [
    filter.ppeItemId,
    historyList,
    ppeItemLabelMap,
    searchedPpeItemOptions,
    selectedHistory?.ppeItemId,
    watchedPpeItemId
  ]);

  const employeeOptions = useMemo<AppSelectOption[]>(() => {
    const optionMap = new Map<string, AppSelectOption>();

    searchedEmployeeOptions.forEach((option) => optionMap.set(String(option.value), option));

    const addKnownEmployeeOption = (employeeId?: number | string) => {
      if (employeeId === undefined || employeeId === null || employeeId === '') return;
      const key = String(employeeId);
      const label = employeeLabelMap[key];
      if (!label || optionMap.has(key)) return;
      optionMap.set(key, { value: key, label });
    };

    historyList.forEach((history) => {
      addKnownEmployeeOption(history.employeeId);
      addKnownEmployeeOption(history.exportEmployeeId);
    });
    addKnownEmployeeOption(filter.employeeId);
    addKnownEmployeeOption(filter.exportEmployeeId);
    addKnownEmployeeOption(selectedHistory?.employeeId);
    addKnownEmployeeOption(selectedHistory?.exportEmployeeId);
    addKnownEmployeeOption(watchedEmployeeId);
    addKnownEmployeeOption(watchedExportEmployeeId);

    return Array.from(optionMap.values());
  }, [
    employeeLabelMap,
    filter.employeeId,
    filter.exportEmployeeId,
    historyList,
    searchedEmployeeOptions,
    selectedHistory?.employeeId,
    selectedHistory?.exportEmployeeId,
    watchedEmployeeId,
    watchedExportEmployeeId
  ]);

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

  const fetchPpeItemOptions = useCallback(
    async (keyword = '') => {
      const requestNo = ppeItemSearchRequestRef.current + K_SIZE_1;
      ppeItemSearchRequestRef.current = requestNo;
      setPpeItemOptionsLoading(true);

      const normalizedKeyword = keyword.trim();
      const response = await ppeItemServices.searchPpeItems({
        page: K_SIZE_0,
        size: DEFAULT_PAGE_SIZE,
        ...(normalizedKeyword ? { itemName: normalizedKeyword } : {})
      });

      if (ppeItemSearchRequestRef.current !== requestNo) return;
      setPpeItemOptionsLoading(false);

      if (!response || !response.data) {
        setSearchedPpeItemOptions([]);
        return;
      }

      const items = response.data.items || [];
      upsertPpeItemLabels(items);
      setSearchedPpeItemOptions(buildPpeItemOptions(items));
    },
    [upsertPpeItemLabels]
  );

  const fetchEmployeeOptions = useCallback(
    async (keyword = '') => {
      const requestNo = employeeSearchRequestRef.current + K_SIZE_1;
      employeeSearchRequestRef.current = requestNo;
      setEmployeeOptionsLoading(true);

      const normalizedKeyword = keyword.trim();
      const response = await employeeServices.searchEmployees({
        page: K_SIZE_0,
        size: DEFAULT_PAGE_SIZE,
        ...(normalizedKeyword ? { fullName: normalizedKeyword } : {})
      });

      if (employeeSearchRequestRef.current !== requestNo) return;
      setEmployeeOptionsLoading(false);

      if (!response || !response.data) {
        setSearchedEmployeeOptions([]);
        return;
      }

      const employees = response.data.items || [];
      upsertEmployeeLabels(employees);
      setSearchedEmployeeOptions(buildEmployeeOptions(employees));
    },
    [upsertEmployeeLabels]
  );

  const debouncedFetchPpeItemOptions = useMemo(
    () => debounce(fetchPpeItemOptions, CONSTANTS.TIME_DEBOUNCE),
    [fetchPpeItemOptions]
  );

  const debouncedFetchEmployeeOptions = useMemo(
    () => debounce(fetchEmployeeOptions, CONSTANTS.TIME_DEBOUNCE),
    [fetchEmployeeOptions]
  );

  const onSearchPpeItems = useCallback(
    (keyword: string) => {
      setPpeItemSearch(keyword);
      debouncedFetchPpeItemOptions(keyword);
    },
    [debouncedFetchPpeItemOptions]
  );

  const onSearchEmployees = useCallback(
    (keyword: string) => {
      setEmployeeSearch(keyword);
      debouncedFetchEmployeeOptions(keyword);
    },
    [debouncedFetchEmployeeOptions]
  );

  const onOpenPpeItemDropdown = useCallback(() => {
    void fetchPpeItemOptions(ppeItemSearch);
  }, [fetchPpeItemOptions, ppeItemSearch]);

  const onOpenEmployeeDropdown = useCallback(() => {
    void fetchEmployeeOptions(employeeSearch);
  }, [employeeSearch, fetchEmployeeOptions]);

  const fetchList = useCallback(
    async (page: number) => {
      setListLoading(true);
      const response = await ppeItemHistoryServices.searchPpeItemHistory(
        buildPpeItemHistorySearchBody(filterApplied, page)
      );
      setListLoading(false);

      if (!response || !response.data) {
        setHistoryList([]);
        setTotal(K_SIZE_0);
        showToast({
          type: TYPE_TOAST.ERROR,
          content: getPpeItemHistoryErrorMessage(
            response as ErrorBase,
            'Tải lịch sử bàn giao thiết bị thất bại'
          )
        });
        return;
      }

      const items = response.data.items || [];
      upsertHistoryLabels(items);
      setHistoryList(items);
      setTotal(response.data.total || K_SIZE_0);
    },
    [filterApplied, upsertHistoryLabels]
  );

  useEffect(() => {
    return () => {
      debouncedFetchPpeItemOptions.cancel();
      debouncedFetchEmployeeOptions.cancel();
    };
  }, [debouncedFetchEmployeeOptions, debouncedFetchPpeItemOptions]);

  useEffect(() => {
    void fetchList(currentPage);
  }, [currentPage, fetchList]);

  const refreshFirstPage = useCallback(() => {
    if (currentPage === K_SIZE_1) {
      void fetchList(K_SIZE_1);
      return;
    }

    setCurrentPage(K_SIZE_1);
  }, [currentPage, fetchList]);

  const updateFilter = useCallback(
    <K extends keyof PpeItemHistoryFilterForm>(key: K, value: PpeItemHistoryFilterForm[K]) => {
      setFilter((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const onApplyFilter = useCallback(() => {
    setFilterApplied(filter);
    setCurrentPage(K_SIZE_1);
  }, [filter]);

  const onResetFilter = useCallback((key?: keyof PpeItemHistoryFilterForm) => {
    if (key) {
      setFilter((prev) => ({ ...prev, [key]: '' }));
      setFilterApplied((prev) => ({ ...prev, [key]: '' }));
    } else {
      setFilter(DEFAULT_PPE_ITEM_HISTORY_FILTER);
      setFilterApplied(DEFAULT_PPE_ITEM_HISTORY_FILTER);
    }
    setCurrentPage(K_SIZE_1);
  }, []);

  const onOpenCreate = useCallback(() => {
    setSelectedHistory(undefined);
    form.reset(DEFAULT_PPE_ITEM_HISTORY_FORM_VALUES);
    setOpenForm(true);
  }, [form]);

  const onOpenUpdate = useCallback(
    async (history: PpeItemHistory) => {
      setDetailLoading(true);
      setSelectedHistory(history);
      upsertHistoryLabels([history]);

      const response = await ppeItemHistoryServices.getPpeItemHistoryDetail({ id: history.id });
      setDetailLoading(false);

      if (response?.data) {
        const detail = { ...history, ...response.data };
        setSelectedHistory(detail);
        form.reset(buildPpeItemHistoryFormValues(detail));
      } else {
        form.reset(buildPpeItemHistoryFormValues(history));
      }

      setOpenForm(true);
    },
    [form, upsertHistoryLabels]
  );

  const onCloseForm = useCallback(() => {
    setSelectedHistory(undefined);
    setOpenForm(false);
    form.reset(DEFAULT_PPE_ITEM_HISTORY_FORM_VALUES);
    submittingRef.current = false;
  }, [form]);

  const onSubmitSuccess = useCallback(
    (content: string) => {
      submittingRef.current = false;
      onCloseForm();
      refreshFirstPage();
      showToast({ type: TYPE_TOAST.SUCCESS, content });
    },
    [onCloseForm, refreshFirstPage]
  );

  const onSubmit = useCallback(
    async (data: PpeItemHistoryForm) => {
      if (submittingRef.current) return;

      submittingRef.current = true;
      setDetailLoading(true);

      const response = selectedHistory
        ? await ppeItemHistoryServices.updatePpeItemHistory(
            buildUpdatePpeItemHistoryBody(selectedHistory.id, data)
          )
        : await ppeItemHistoryServices.createPpeItemHistory(buildCreatePpeItemHistoryBody(data));

      setDetailLoading(false);

      if (hasApiError(response as ErrorBase)) {
        submittingRef.current = false;
        showToast({
          type: TYPE_TOAST.ERROR,
          content: getPpeItemHistoryErrorMessage(
            response as ErrorBase,
            selectedHistory
              ? 'Cập nhật lịch sử bàn giao thiết bị thất bại'
              : 'Thêm lịch sử bàn giao thiết bị thất bại'
          )
        });
        return;
      }

      onSubmitSuccess(
        selectedHistory
          ? 'Cập nhật lịch sử bàn giao thiết bị thành công'
          : 'Thêm lịch sử bàn giao thiết bị thành công'
      );
    },
    [onSubmitSuccess, selectedHistory]
  );

  const onDelete = useCallback(
    (history: PpeItemHistory) => {
      showDialog({
        title: t('common:delete_confirm'),
        content: `Bạn có chắc chắn xoá lịch sử bàn giao ${getHistoryPpeItemLabel(history) || history.id}?`,
        type: TYPE_MESSAGE.ALERT,
        actions: [
          {
            title: t('common:agree'),
            type: TYPE_ACTION.PRIMARY,
            onPress: async () => {
              const response = await ppeItemHistoryServices.deletePpeItemHistory({
                id: history.id
              });

              if (hasApiError(response as ErrorBase)) {
                showToast({
                  type: TYPE_TOAST.ERROR,
                  content: getPpeItemHistoryErrorMessage(
                    response as ErrorBase,
                    'Xoá lịch sử bàn giao thiết bị thất bại'
                  )
                });
                return;
              }

              refreshFirstPage();
              showToast({
                type: TYPE_TOAST.SUCCESS,
                content: 'Xoá lịch sử bàn giao thiết bị thành công'
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
    [refreshFirstPage, t]
  );

  const getPpeItemName = useCallback(
    (ppeItemId?: number) => {
      if (ppeItemId === undefined || ppeItemId === null) return '';
      return ppeItemLabelMap[String(ppeItemId)] || String(ppeItemId);
    },
    [ppeItemLabelMap]
  );

  const getEmployeeName = useCallback(
    (employeeId?: number) => {
      if (employeeId === undefined || employeeId === null) return '';
      return employeeLabelMap[String(employeeId)] || String(employeeId);
    },
    [employeeLabelMap]
  );

  return {
    t,
    historyList,
    total,
    listLoading,
    detailLoading,
    currentPage,
    pagination,
    filter,
    filterApplied,
    ppeItemOptions,
    employeeOptions,
    ppeItemSearch,
    employeeSearch,
    ppeItemOptionsLoading,
    employeeOptionsLoading,
    openForm,
    selectedHistory,
    form,
    onSearchPpeItems,
    onSearchEmployees,
    onOpenPpeItemDropdown,
    onOpenEmployeeDropdown,
    updateFilter,
    onApplyFilter,
    onResetFilter,
    onOpenCreate,
    onOpenUpdate,
    onCloseForm,
    onSubmit,
    onDelete,
    getPpeItemName,
    getEmployeeName
  };
}
