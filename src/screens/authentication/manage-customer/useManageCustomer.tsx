import { DEFAULT_PAGE_SIZE, K_SIZE_1, K_SIZE_200 } from '@constant';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CUSTOMER_CREATE,
  CUSTOMER_DELETE,
  CUSTOMER_DETAIL,
  CUSTOMER_SEARCH,
  CUSTOMER_UPDATE
} from '@redux-action-type/customer-type';
import { dispatch } from '@redux-common';
import {
  selectCustomerDetailLoading,
  selectCustomerLoading,
  selectCustomers,
  selectCustomerTotal
} from '@redux-selector/customer-selector';
import { showDialog } from 'components/dialog';
import { TYPE_ACTION, TYPE_MESSAGE } from 'components/dialog/type';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import { ErrorBase } from 'model/common';
import {
  CreateCustomerReq,
  Customer,
  CustomerDetail,
  CustomerDetailRes,
  CustomerSearchReq,
  UpdateCustomerReq
} from 'model/customer';
import { OperationUnit } from 'model/operation-unit';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import operationUnitServices from 'services/operation-unit-services';
import { normalizeDateToApi } from 'utils/date';
import { useAppTranslation } from 'utils/i18n';
import { z } from 'zod';

export interface CustomerFilter {
  customerCodeContains: string;
  fullNameContains: string;
  taxNoContains: string;
  phoneContains: string;
  emailContains: string;
  contactNameContains: string;
  addressContains: string;
}

export const DEFAULT_CUSTOMER_FILTER: CustomerFilter = {
  customerCodeContains: '',
  fullNameContains: '',
  taxNoContains: '',
  phoneContains: '',
  emailContains: '',
  contactNameContains: '',
  addressContains: ''
};

const SUCCESS_MESSAGES = ['success', 'ok'];
const SUCCESS_CODE_STATUSES = [
  ...SUCCESS_MESSAGES,
  '0',
  '00',
  '000',
  '0000',
  '00000',
  '000000',
  '200',
  '201',
  '204'
];

const normalizeApiText = (value?: unknown) =>
  String(value || '')
    .trim()
    .toLowerCase();

const isSuccessMessage = (message?: unknown) =>
  SUCCESS_MESSAGES.includes(normalizeApiText(message));

const optionalTextSchema = z.preprocess((value) => value ?? '', z.string().trim());

const customerSchema = z.object({
  customerCode: z.string().trim().min(K_SIZE_1, { message: 'Vui lòng nhập mã khách hàng' }),
  fullName: optionalTextSchema,
  taxNo: optionalTextSchema.refine((value) => !value || /^[A-Za-z0-9-]*$/.test(value), {
    message: 'Mã số thuế không hợp lệ'
  }),
  phone: optionalTextSchema.refine((value) => !value || /^\+?[0-9]{8,15}$/.test(value), {
    message: 'Số điện thoại không hợp lệ'
  }),
  email: optionalTextSchema.refine((value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), {
    message: 'Email không hợp lệ'
  }),
  contactName: optionalTextSchema,
  contactIdNo: optionalTextSchema,
  contactIssueDate: optionalTextSchema,
  address: optionalTextSchema,
  operationUnitId: optionalTextSchema
});

export type CustomerForm = z.infer<typeof customerSchema>;

export const getCustomerErrorMessage = (
  error?: ErrorBase & { message?: string },
  fallback = 'Thao tác thất bại'
) => {
  const message =
    error?.businessErrorMessage ||
    error?.systemErrorMessage ||
    error?.detailMessage ||
    error?.message;
  const normalizedMessage = normalizeApiText(message);

  return message && !SUCCESS_MESSAGES.includes(normalizedMessage) ? message : fallback;
};

const hasApiError = (
  response?: ErrorBase & {
    codeStatus?: string;
    error?: unknown;
    status?: number;
    statusCode?: number;
  }
) => {
  if (!response) return true;

  const status = Number(response.status ?? response.statusCode);
  const normalizedCodeStatus = normalizeApiText(response.codeStatus);
  const hasResponseError = Boolean(
    response.businessErrorMessage ||
      response.systemErrorMessage ||
      response.detailMessage ||
      response.error
  );

  if ((Number.isFinite(status) && status >= 400) || hasResponseError) return true;
  if (isSuccessMessage(response.message)) return false;

  return Boolean(
    normalizedCodeStatus &&
      !SUCCESS_CODE_STATUSES.includes(normalizedCodeStatus) &&
      !normalizedCodeStatus.startsWith('2')
  );
};

const optionalValue = (value?: string) => {
  const trimmedValue = value?.trim();
  return trimmedValue || undefined;
};

const updateTextValue = (value?: string) => value?.trim() || '';

const buildFormValues = (customer?: Customer): CustomerForm => ({
  customerCode: customer?.customerCode || '',
  fullName: customer?.fullName || '',
  taxNo: customer?.taxNo || '',
  phone: customer?.phone || '',
  email: customer?.email || '',
  contactName: customer?.contactName || '',
  contactIdNo: customer?.contactIdNo || '',
  contactIssueDate: normalizeDateToApi(customer?.contactIssueDate),
  address: customer?.address || '',
  operationUnitId: customer?.operationUnitId || ''
});

export default function useManageCustomer() {
  const { t } = useAppTranslation();
  const customerList = useSelector(selectCustomers);
  const total = useSelector(selectCustomerTotal);
  const listLoading = useSelector(selectCustomerLoading);
  const detailLoading = useSelector(selectCustomerDetailLoading);

  const [currentPage, setCurrentPage] = useState<number>(K_SIZE_1);
  const [filter, setFilter] = useState<CustomerFilter>(DEFAULT_CUSTOMER_FILTER);
  const [filterApplied, setFilterApplied] = useState<CustomerFilter>(DEFAULT_CUSTOMER_FILTER);
  const [openForm, setOpenForm] = useState<boolean>(false);
  const [openDetail, setOpenDetail] = useState<boolean>(false);
  const [detailLoadFailed, setDetailLoadFailed] = useState<boolean>(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer>();
  const [selectedDetail, setSelectedDetail] = useState<CustomerDetail>();
  const [operationUnitLoading, setOperationUnitLoading] = useState<boolean>(false);
  const [operationUnitOptions, setOperationUnitOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const submittingRef = useRef<boolean>(false);

  const form = useForm<CustomerForm>({
    mode: 'onTouched',
    defaultValues: buildFormValues(),
    resolver: zodResolver(customerSchema)
  });

  const buildSearchBody = useCallback(
    (appliedFilter: CustomerFilter, page: number): CustomerSearchReq => ({
      page: page - K_SIZE_1,
      size: DEFAULT_PAGE_SIZE,
      customerCodeContains: optionalValue(appliedFilter.customerCodeContains),
      fullNameContains: optionalValue(appliedFilter.fullNameContains),
      taxNoContains: optionalValue(appliedFilter.taxNoContains),
      phoneContains: optionalValue(appliedFilter.phoneContains),
      emailContains: optionalValue(appliedFilter.emailContains),
      contactNameContains: optionalValue(appliedFilter.contactNameContains),
      addressContains: optionalValue(appliedFilter.addressContains)
    }),
    []
  );

  const fetchList = useCallback(
    (page: number) => {
      dispatch({
        type: CUSTOMER_SEARCH,
        payload: {
          body: buildSearchBody(filterApplied, page),
          onFailed: (error?: ErrorBase) => {
            showToast({
              type: TYPE_TOAST.ERROR,
              content: getCustomerErrorMessage(error, 'Tải danh sách khách hàng thất bại')
            });
          }
        }
      });
    },
    [buildSearchBody, filterApplied]
  );

  useEffect(() => {
    fetchList(currentPage);
  }, [currentPage, fetchList]);

  useEffect(() => {
    let isMounted = true;

    const fetchOperationUnits = async () => {
      setOperationUnitLoading(true);
      const response = await operationUnitServices.searchOperationUnits({
        page: 0,
        size: K_SIZE_200
      });
      if (!isMounted) return;

      setOperationUnitLoading(false);

      if (hasApiError(response)) {
        showToast({
          type: TYPE_TOAST.ERROR,
          content: getCustomerErrorMessage(response, 'Tải danh sách đơn vị vận hành thất bại')
        });
        return;
      }

      const operationUnits = Array.isArray(response.data?.items) ? response.data.items : [];

      setOperationUnitOptions(
        operationUnits
          .filter((operationUnit: OperationUnit) => Boolean(operationUnit.operationUnitId))
          .map((operationUnit: OperationUnit) => ({
            value: operationUnit.operationUnitId,
            label:
              [operationUnit.unitCode, operationUnit.unitName].filter(Boolean).join(' - ') ||
              operationUnit.operationUnitId
          }))
      );
    };

    fetchOperationUnits();

    return () => {
      isMounted = false;
    };
  }, []);

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

  const refreshFirstPage = useCallback(() => {
    if (currentPage === K_SIZE_1) {
      fetchList(K_SIZE_1);
      return;
    }

    setCurrentPage(K_SIZE_1);
  }, [currentPage, fetchList]);

  const refreshAfterDelete = useCallback(() => {
    if (customerList.length === K_SIZE_1 && currentPage > K_SIZE_1) {
      setCurrentPage(currentPage - K_SIZE_1);
      return;
    }

    fetchList(currentPage);
  }, [currentPage, customerList.length, fetchList]);

  const onChangeFilter = useCallback(
    (key: keyof CustomerFilter, value: CustomerFilter[keyof CustomerFilter]) => {
      setFilter((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const onApplyFilter = useCallback(() => {
    setFilterApplied(filter);
    setCurrentPage(K_SIZE_1);
  }, [filter]);

  const onResetFilter = useCallback((key?: keyof CustomerFilter) => {
    if (key) {
      setFilter((prev) => ({ ...prev, [key]: DEFAULT_CUSTOMER_FILTER[key] }));
      setFilterApplied((prev) => ({ ...prev, [key]: DEFAULT_CUSTOMER_FILTER[key] }));
    } else {
      setFilter(DEFAULT_CUSTOMER_FILTER);
      setFilterApplied(DEFAULT_CUSTOMER_FILTER);
    }
    setCurrentPage(K_SIZE_1);
  }, []);

  const onOpenCreate = useCallback(() => {
    setSelectedCustomer(undefined);
    form.reset(buildFormValues());
    setOpenForm(true);
  }, [form]);

  const onOpenUpdate = useCallback(
    (customer: Customer) => {
      setSelectedCustomer(customer);
      form.reset(buildFormValues(customer));
      setOpenForm(true);
    },
    [form]
  );

  const onCloseForm = useCallback(() => {
    setOpenForm(false);
    setSelectedCustomer(undefined);
    submittingRef.current = false;
    form.reset(buildFormValues());
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

  const buildCreateBody = useCallback(
    (data: CustomerForm): CreateCustomerReq => ({
      customerCode: data.customerCode.trim(),
      fullName: optionalValue(data.fullName),
      taxNo: optionalValue(data.taxNo),
      phone: optionalValue(data.phone),
      email: optionalValue(data.email),
      contactName: optionalValue(data.contactName),
      contactIdNo: optionalValue(data.contactIdNo),
      contactIssueDate: optionalValue(normalizeDateToApi(data.contactIssueDate)),
      address: optionalValue(data.address),
      operationUnitId: optionalValue(data.operationUnitId)
    }),
    []
  );

  const buildUpdateBody = useCallback(
    (id: string, data: CustomerForm): UpdateCustomerReq => ({
      id,
      customerCode: data.customerCode.trim(),
      fullName: updateTextValue(data.fullName),
      taxNo: updateTextValue(data.taxNo),
      phone: updateTextValue(data.phone),
      email: updateTextValue(data.email),
      contactName: updateTextValue(data.contactName),
      contactIdNo: updateTextValue(data.contactIdNo),
      contactIssueDate: updateTextValue(normalizeDateToApi(data.contactIssueDate)),
      address: updateTextValue(data.address),
      operationUnitId: optionalValue(data.operationUnitId)
    }),
    []
  );

  const handleSubmit = useCallback(
    (data: CustomerForm) => {
      if (submittingRef.current) return;
      submittingRef.current = true;

      if (selectedCustomer) {
        if (!selectedCustomer.id) {
          submittingRef.current = false;
          showToast({
            type: TYPE_TOAST.ERROR,
            content: 'Không tìm thấy ID khách hàng để cập nhật'
          });
          return;
        }

        dispatch({
          type: CUSTOMER_UPDATE,
          payload: {
            body: buildUpdateBody(selectedCustomer.id, data),
            onSuccess: () => onSubmitSuccess('Cập nhật khách hàng thành công'),
            onFailed: (error?: ErrorBase) => {
              submittingRef.current = false;
              showToast({
                type: TYPE_TOAST.ERROR,
                content: getCustomerErrorMessage(error, 'Cập nhật khách hàng thất bại')
              });
            }
          }
        });
        return;
      }

      dispatch({
        type: CUSTOMER_CREATE,
        payload: {
          body: buildCreateBody(data),
          onSuccess: () => onSubmitSuccess('Thêm mới khách hàng thành công'),
          onFailed: (error?: ErrorBase) => {
            submittingRef.current = false;
            showToast({
              type: TYPE_TOAST.ERROR,
              content: getCustomerErrorMessage(error, 'Thêm mới khách hàng thất bại')
            });
          }
        }
      });
    },
    [buildCreateBody, buildUpdateBody, onSubmitSuccess, selectedCustomer]
  );

  const onOpenDetail = useCallback((customer: Customer) => {
    setSelectedDetail(undefined);
    setDetailLoadFailed(false);
    setOpenDetail(true);

    if (!customer.id) {
      setSelectedDetail({ customer });
      setDetailLoadFailed(true);
      return;
    }

    dispatch({
      type: CUSTOMER_DETAIL,
      payload: {
        body: { id: customer.id },
        onSuccess: (response: CustomerDetailRes) => {
          setDetailLoadFailed(false);
          setSelectedDetail(response.data || { customer });
        },
        onFailed: (error?: ErrorBase) => {
          setDetailLoadFailed(true);
          setSelectedDetail({ customer });
          showToast({
            type: TYPE_TOAST.ERROR,
            content: getCustomerErrorMessage(error, 'Tải chi tiết khách hàng thất bại')
          });
        }
      }
    });
  }, []);

  const onCloseDetail = useCallback(() => {
    setOpenDetail(false);
    setSelectedDetail(undefined);
    setDetailLoadFailed(false);
  }, []);

  const onDeleteSuccess = useCallback(() => {
    refreshAfterDelete();
    showToast({ type: TYPE_TOAST.SUCCESS, content: 'Xoá khách hàng thành công' });
  }, [refreshAfterDelete]);

  const onDelete = useCallback(
    (customer: Customer) => {
      if (!customer.id) {
        showToast({ type: TYPE_TOAST.ERROR, content: 'Không tìm thấy ID khách hàng để xoá' });
        return;
      }

      showDialog({
        title: t('common:delete_confirm'),
        content: (
          <>
            Bạn có chắc chắn xoá khách hàng{' '}
            <strong>{customer.customerCode || customer.fullName}</strong> này?
          </>
        ),
        type: TYPE_MESSAGE.ALERT,
        actions: [
          {
            title: t('common:agree'),
            type: TYPE_ACTION.PRIMARY,
            onPress: () => {
              dispatch({
                type: CUSTOMER_DELETE,
                payload: {
                  body: { id: customer.id },
                  onSuccess: onDeleteSuccess,
                  onFailed: (error?: ErrorBase) => {
                    showToast({
                      type: TYPE_TOAST.ERROR,
                      content: getCustomerErrorMessage(error, 'Xoá khách hàng thất bại')
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
    [onDeleteSuccess, t]
  );

  return {
    t,
    customerList,
    total,
    listLoading,
    detailLoading,
    detailLoadFailed,
    currentPage,
    pagination,
    filter,
    filterApplied,
    openForm,
    openDetail,
    selectedCustomer,
    selectedDetail,
    operationUnitLoading,
    operationUnitOptions,
    form,
    onChangeFilter,
    onApplyFilter,
    onResetFilter,
    onOpenCreate,
    onOpenUpdate,
    onCloseForm,
    handleSubmit,
    onOpenDetail,
    onCloseDetail,
    onDelete
  };
}
