import { DEFAULT_PAGE_SIZE, K_SIZE_1 } from '@constant';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CUSTOMER_CREATE,
  CUSTOMER_DELETE,
  CUSTOMER_SEARCH
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
  CustomerPerson,
  CustomerSearchReq,
  UpdateCustomerReq
} from 'model/customer';
import { DOCUMENT_OWNER_TYPE } from 'model/document';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { ROUTES } from 'config/routes';
import { customerDocumentOwnerId, uploadOwnerDocuments } from 'utils/document-upload';
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

const personSchema = z.object({
  fullName: optionalTextSchema,
  idNo: optionalTextSchema.refine((value) => !value || /^([0-9]{9}|[0-9]{12})$/.test(value), {
    message: 'CCCD gồm 9 hoặc 12 chữ số'
  }),
  phone: optionalTextSchema.refine((value) => !value || /^\+?[0-9]{8,15}$/.test(value), {
    message: 'Số điện thoại không hợp lệ'
  }),
  email: optionalTextSchema.refine((value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), {
    message: 'Email không hợp lệ'
  })
});

export const customerSchema = z.object({
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
  address: optionalTextSchema,
  representative: personSchema,
  chiefAccountant: personSchema,
  contactPerson: personSchema
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

export const hasApiError = (
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

const toPersonForm = (person?: CustomerPerson | null) => ({
  fullName: person?.fullName || '',
  idNo: person?.idNo || '',
  phone: person?.phone || '',
  email: person?.email || ''
});

/** Người để trống cả 4 ô → null (BE xoá vai trò). */
const toPersonBody = (person?: CustomerForm['representative']): CustomerPerson | null => {
  const value = {
    fullName: optionalValue(person?.fullName),
    idNo: optionalValue(person?.idNo),
    phone: optionalValue(person?.phone),
    email: optionalValue(person?.email)
  };
  return Object.values(value).some(Boolean) ? value : null;
};

const buildPersonsBody = (data: CustomerForm) => ({
  representative: toPersonBody(data.representative),
  chiefAccountant: toPersonBody(data.chiefAccountant),
  contactPerson: toPersonBody(data.contactPerson)
});

export const buildFormValues = (customer?: Customer): CustomerForm => ({
  customerCode: customer?.customerCode || '',
  fullName: customer?.fullName || '',
  taxNo: customer?.taxNo || '',
  phone: customer?.phone || '',
  email: customer?.email || '',
  address: customer?.address || '',
  representative: toPersonForm(customer?.representative),
  chiefAccountant: toPersonForm(customer?.chiefAccountant),
  // KH cũ chỉ có contact_name/contact_id_no → điền sẵn vào khối người liên hệ
  contactPerson: toPersonForm(
    customer?.contactPerson || { fullName: customer?.contactName, idNo: customer?.contactIdNo }
  )
});

export const buildUpdateBody = (id: number, data: CustomerForm): UpdateCustomerReq => ({
  id,
  customerCode: data.customerCode.trim(),
  fullName: updateTextValue(data.fullName),
  taxNo: updateTextValue(data.taxNo),
  phone: updateTextValue(data.phone),
  email: updateTextValue(data.email),
  address: updateTextValue(data.address),
  ...buildPersonsBody(data)
});

export default function useManageCustomer() {
  const { t } = useAppTranslation();
  const router = useRouter();
  const customerList = useSelector(selectCustomers);
  const total = useSelector(selectCustomerTotal);
  const listLoading = useSelector(selectCustomerLoading);
  const detailLoading = useSelector(selectCustomerDetailLoading);

  const [currentPage, setCurrentPage] = useState<number>(K_SIZE_1);
  const [filter, setFilter] = useState<CustomerFilter>(DEFAULT_CUSTOMER_FILTER);
  const [filterApplied, setFilterApplied] = useState<CustomerFilter>(DEFAULT_CUSTOMER_FILTER);
  const [openForm, setOpenForm] = useState<boolean>(false);
  const [attachments, setAttachments] = useState<File[]>([]);
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
    form.reset(buildFormValues());
    setAttachments([]);
    setOpenForm(true);
  }, [form]);

  const onOpenUpdate = useCallback(
    (customer: Customer) => {
      if (!customer.id) {
        showToast({ type: TYPE_TOAST.ERROR, content: 'Không tìm thấy ID khách hàng để cập nhật' });
        return;
      }

      router.push(`${ROUTES.MANAGE_CUSTOMER_EDIT}?id=${encodeURIComponent(String(customer.id))}`);
    },
    [router]
  );

  const onCloseForm = useCallback(() => {
    setOpenForm(false);
    submittingRef.current = false;
    form.reset(buildFormValues());
    setAttachments([]);
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
      address: optionalValue(data.address),
      ...buildPersonsBody(data)
    }),
    []
  );

  const handleSubmit = useCallback(
    (data: CustomerForm) => {
      if (submittingRef.current) return;
      submittingRef.current = true;

      dispatch({
        type: CUSTOMER_CREATE,
        payload: {
          body: buildCreateBody(data),
          onSuccess: async (response?: { data?: Customer }) => {
            const createdId = response?.data?.id;
            if (createdId && attachments.length) {
              const failed = await uploadOwnerDocuments(
                DOCUMENT_OWNER_TYPE.CUSTOMER,
                customerDocumentOwnerId(createdId),
                attachments
              );
              if (failed.length) {
                showToast({
                  type: TYPE_TOAST.ERROR,
                  content: `Đã tạo khách hàng nhưng tải lên thất bại: ${failed.join(', ')}`
                });
              }
            }
            onSubmitSuccess('Thêm mới khách hàng thành công');
          },
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
    [attachments, buildCreateBody, onSubmitSuccess]
  );

  const onOpenDetail = useCallback(
    (customer: Customer) => {
      if (!customer.id) {
        showToast({ type: TYPE_TOAST.ERROR, content: 'Không tìm thấy ID khách hàng' });
        return;
      }

      router.push(`${ROUTES.MANAGE_CUSTOMER_DETAIL}?id=${encodeURIComponent(String(customer.id))}`);
    },
    [router]
  );

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
    currentPage,
    pagination,
    filter,
    filterApplied,
    openForm,
    attachments,
    setAttachments,
    form,
    onChangeFilter,
    onApplyFilter,
    onResetFilter,
    onOpenCreate,
    onOpenUpdate,
    onCloseForm,
    handleSubmit,
    onOpenDetail,
    onDelete
  };
}
