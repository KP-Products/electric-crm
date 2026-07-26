import { CONSTANTS, DEFAULT_PAGE_SIZE, K_SIZE_0, K_SIZE_1 } from '@constant';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CREATE_PPE_ITEM,
  DELETE_PPE_ITEM,
  SEARCH_PPE_ITEM,
  UPDATE_PPE_ITEM
} from '@redux-action-type/ppe-item';
import { dispatch } from '@redux-common';
import {
  selectPpeItemList,
  selectPpeItemLoadingDetail,
  selectPpeItemLoadingList,
  selectPpeItemTotal
} from '@redux-selector/ppe-item';
import { showDialog } from 'components/dialog';
import { TYPE_ACTION, TYPE_MESSAGE } from 'components/dialog/type';
import type { AppSelectOption } from 'components/select';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import { ErrorBase } from 'model/common';
import { Employee } from 'model/employee';
import { PpeItem } from 'model/ppe-item';
import { debounce } from 'lodash';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import employeeServices from 'services/employee-services';
import { useAppTranslation } from 'utils/i18n';
import { z } from 'zod';
import {
  buildCreatePpeItemBody,
  buildPpeItemFormValues,
  buildPpeItemSearchBody,
  buildUpdatePpeItemBody,
  DEFAULT_PPE_ITEM_FILTER,
  DEFAULT_PPE_ITEM_FORM_VALUES,
  getPpeItemErrorMessage
} from './utils';
import usePpeItemPermission from './usePpeItemPermission';

const optionalString = z.preprocess(
  (value) => (value === null || value === undefined ? '' : value),
  z.string().trim()
);

const ppeItemSchema = z.object({
  itemCode: z.string().trim().min(K_SIZE_1, { message: 'Vui lòng nhập mã thiết bị' }),
  itemName: z.string().trim().min(K_SIZE_1, { message: 'Vui lòng nhập tên thiết bị' }),
  category: optionalString,
  unit: optionalString,
  quantity: z
    .string()
    .trim()
    .refine((value) => !value || /^\d+$/.test(value), {
      message: 'Số lượng phải là số nguyên không âm'
    }),
  importDate: optionalString,
  employeeId: optionalString,
  status: optionalString,
  note: optionalString
});

export type PpeItemForm = z.infer<typeof ppeItemSchema>;

export interface PpeItemFilterForm {
  itemCode: string;
  itemName: string;
  status: string;
  employeeId: string;
}

const getEmployeeLabel = (employee: Employee) =>
  employee.fullName || employee.employeeCode || employee.email || String(employee.id);

export default function usePpeItems() {
  const { t } = useAppTranslation();
  const { permission } = usePpeItemPermission();
  const ppeItemList = useSelector(selectPpeItemList);
  const total = useSelector(selectPpeItemTotal);
  const listLoading = useSelector(selectPpeItemLoadingList);
  const detailLoading = useSelector(selectPpeItemLoadingDetail);

  const [currentPage, setCurrentPage] = useState<number>(K_SIZE_1);
  const [filter, setFilter] = useState<PpeItemFilterForm>(DEFAULT_PPE_ITEM_FILTER);
  const [filterApplied, setFilterApplied] = useState<PpeItemFilterForm>(DEFAULT_PPE_ITEM_FILTER);
  const [employeeLabelMap, setEmployeeLabelMap] = useState<Record<string, string>>({});
  const [searchedEmployeeOptions, setSearchedEmployeeOptions] = useState<AppSelectOption[]>([]);
  const [employeeSearch, setEmployeeSearch] = useState<string>('');
  const [employeeOptionsLoading, setEmployeeOptionsLoading] = useState<boolean>(false);
  const [openForm, setOpenForm] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<PpeItem>();
  const submittingRef = useRef<boolean>(false);
  const employeeSearchRequestRef = useRef<number>(K_SIZE_0);

  const form = useForm<PpeItemForm>({
    mode: 'onTouched',
    defaultValues: DEFAULT_PPE_ITEM_FORM_VALUES,
    resolver: zodResolver(ppeItemSchema)
  });

  const upsertEmployeeLabels = useCallback((employeeItems: Employee[]) => {
    setEmployeeLabelMap((prev) => {
      let hasChange = false;
      const next = { ...prev };

      employeeItems.forEach((employee) => {
        if (employee?.id === undefined || employee.id === null) return;
        const key = String(employee.id);
        const label = getEmployeeLabel(employee);
        if (next[key] === label) return;
        next[key] = label;
        hasChange = true;
      });

      return hasChange ? next : prev;
    });
  }, []);

  const employeeOptions = useMemo<AppSelectOption[]>(() => {
    const optionMap = new Map<string, AppSelectOption>();

    searchedEmployeeOptions.forEach((option) => {
      optionMap.set(String(option.value), option);
    });

    const addKnownEmployeeOption = (employeeId?: number | string) => {
      if (employeeId === undefined || employeeId === null || employeeId === '') return;
      const key = String(employeeId);
      const label = employeeLabelMap[key];
      if (!label || optionMap.has(key)) return;
      optionMap.set(key, { value: key, label });
    };

    ppeItemList.forEach((item) => addKnownEmployeeOption(item.employeeId));
    addKnownEmployeeOption(filter.employeeId);
    addKnownEmployeeOption(selectedItem?.employeeId);

    return Array.from(optionMap.values());
  }, [
    employeeLabelMap,
    filter.employeeId,
    ppeItemList,
    searchedEmployeeOptions,
    selectedItem?.employeeId
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

      const employeeItems = response.data.items || [];
      upsertEmployeeLabels(employeeItems);
      setSearchedEmployeeOptions(
        employeeItems.map((employee) => ({
          value: String(employee.id),
          label: getEmployeeLabel(employee)
        }))
      );
    },
    [upsertEmployeeLabels]
  );

  const debouncedFetchEmployeeOptions = useMemo(
    () => debounce(fetchEmployeeOptions, CONSTANTS.TIME_DEBOUNCE),
    [fetchEmployeeOptions]
  );

  const onSearchEmployees = useCallback(
    (keyword: string) => {
      setEmployeeSearch(keyword);
      debouncedFetchEmployeeOptions(keyword);
    },
    [debouncedFetchEmployeeOptions]
  );

  const onOpenEmployeeDropdown = useCallback(() => {
    void fetchEmployeeOptions(employeeSearch);
  }, [employeeSearch, fetchEmployeeOptions]);

  const fetchList = useCallback(
    (page: number) => {
      dispatch({
        type: SEARCH_PPE_ITEM,
        payload: {
          body: buildPpeItemSearchBody(filterApplied, page),
          onFailed: (error?: ErrorBase) => {
            showToast({
              type: TYPE_TOAST.ERROR,
              content: getPpeItemErrorMessage(error, 'Tải danh sách bảo hộ lao động thất bại')
            });
          }
        }
      });
    },
    [filterApplied]
  );

  useEffect(() => {
    return () => {
      debouncedFetchEmployeeOptions.cancel();
    };
  }, [debouncedFetchEmployeeOptions]);

  useEffect(() => {
    fetchList(currentPage);
  }, [currentPage, fetchList]);

  const refreshFirstPage = useCallback(() => {
    if (currentPage === K_SIZE_1) {
      fetchList(K_SIZE_1);
      return;
    }

    setCurrentPage(K_SIZE_1);
  }, [currentPage, fetchList]);

  const updateFilter = useCallback(
    <K extends keyof PpeItemFilterForm>(key: K, value: PpeItemFilterForm[K]) => {
      setFilter((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const onApplyFilter = useCallback(() => {
    setFilterApplied(filter);
    setCurrentPage(K_SIZE_1);
  }, [filter]);

  const onResetFilter = useCallback((key?: keyof PpeItemFilterForm) => {
    if (key) {
      setFilter((prev) => ({ ...prev, [key]: '' }));
      setFilterApplied((prev) => ({ ...prev, [key]: '' }));
    } else {
      setFilter(DEFAULT_PPE_ITEM_FILTER);
      setFilterApplied(DEFAULT_PPE_ITEM_FILTER);
    }
    setCurrentPage(K_SIZE_1);
  }, []);

  const onOpenCreate = useCallback(() => {
    if (!permission.canAdd) {
      showToast({ type: TYPE_TOAST.ERROR, content: 'Bạn không có quyền thêm bảo hộ lao động' });
      return;
    }

    setSelectedItem(undefined);
    form.reset(DEFAULT_PPE_ITEM_FORM_VALUES);
    setOpenForm(true);
  }, [form, permission.canAdd]);

  const onOpenUpdate = useCallback(
    (item: PpeItem) => {
      if (!permission.canEdit) {
        showToast({
          type: TYPE_TOAST.ERROR,
          content: 'Bạn không có quyền cập nhật bảo hộ lao động'
        });
        return;
      }

      setSelectedItem(item);
      form.reset(buildPpeItemFormValues(item));
      setOpenForm(true);
    },
    [form, permission.canEdit]
  );

  const onCloseForm = useCallback(() => {
    setSelectedItem(undefined);
    setOpenForm(false);
    form.reset(DEFAULT_PPE_ITEM_FORM_VALUES);
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
    (data: PpeItemForm) => {
      if (submittingRef.current) return;

      if (selectedItem && !permission.canEdit) {
        showToast({
          type: TYPE_TOAST.ERROR,
          content: 'Bạn không có quyền cập nhật bảo hộ lao động'
        });
        return;
      }

      if (!selectedItem && !permission.canAdd) {
        showToast({ type: TYPE_TOAST.ERROR, content: 'Bạn không có quyền thêm bảo hộ lao động' });
        return;
      }

      submittingRef.current = true;

      if (selectedItem) {
        dispatch({
          type: UPDATE_PPE_ITEM,
          payload: {
            body: buildUpdatePpeItemBody(selectedItem.id, data),
            onSuccess: () => onSubmitSuccess('Cập nhật bảo hộ lao động thành công'),
            onFailed: (error?: ErrorBase) => {
              submittingRef.current = false;
              showToast({
                type: TYPE_TOAST.ERROR,
                content: getPpeItemErrorMessage(error, 'Cập nhật bảo hộ lao động thất bại')
              });
            }
          }
        });
        return;
      }

      dispatch({
        type: CREATE_PPE_ITEM,
        payload: {
          body: buildCreatePpeItemBody(data),
          onSuccess: () => onSubmitSuccess('Thêm bảo hộ lao động thành công'),
          onFailed: (error?: ErrorBase) => {
            submittingRef.current = false;
            showToast({
              type: TYPE_TOAST.ERROR,
              content: getPpeItemErrorMessage(error, 'Thêm bảo hộ lao động thất bại')
            });
          }
        }
      });
    },
    [onSubmitSuccess, permission.canAdd, permission.canEdit, selectedItem]
  );

  const onDelete = useCallback(
    (item: PpeItem) => {
      if (!permission.canDelete) {
        showToast({ type: TYPE_TOAST.ERROR, content: 'Bạn không có quyền xoá bảo hộ lao động' });
        return;
      }

      showDialog({
        title: t('common:delete_confirm'),
        content: `Bạn có chắc chắn xoá thiết bị ${item.itemCode || item.itemName || item.id}?`,
        type: TYPE_MESSAGE.ALERT,
        actions: [
          {
            title: t('common:agree'),
            type: TYPE_ACTION.PRIMARY,
            onPress: () => {
              dispatch({
                type: DELETE_PPE_ITEM,
                payload: {
                  body: { id: item.id },
                  onSuccess: () => {
                    refreshFirstPage();
                    showToast({
                      type: TYPE_TOAST.SUCCESS,
                      content: 'Xoá bảo hộ lao động thành công'
                    });
                  },
                  onFailed: (error?: ErrorBase) => {
                    showToast({
                      type: TYPE_TOAST.ERROR,
                      content: getPpeItemErrorMessage(error, 'Xoá bảo hộ lao động thất bại')
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
    [permission.canDelete, refreshFirstPage, t]
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
    ppeItemList,
    total,
    listLoading,
    detailLoading,
    currentPage,
    pagination,
    filter,
    filterApplied,
    employeeOptions,
    employeeSearch,
    employeeOptionsLoading,
    openForm,
    selectedItem,
    permission,
    form,
    onSearchEmployees,
    onOpenEmployeeDropdown,
    updateFilter,
    onApplyFilter,
    onResetFilter,
    onOpenCreate,
    onOpenUpdate,
    onCloseForm,
    onSubmit,
    onDelete,
    getEmployeeName
  };
}
