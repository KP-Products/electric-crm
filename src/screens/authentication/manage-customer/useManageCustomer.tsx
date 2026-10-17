import { hasApiError } from 'utils/api-response';
export { hasApiError } from 'utils/api-response';
import { DEFAULT_PAGE_SIZE, K_SIZE_1 } from '@constant';
import { zodResolver } from '@hookform/resolvers/zod';
import { CUSTOMER_DELETE, CUSTOMER_SEARCH } from '@redux-action-type/customer-type';
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
import { CreateCustomerReq, Customer, CustomerSearchReq, UpdateCustomerReq } from 'model/customer';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { ROUTES } from 'config/routes';
import { normalizeDateToApi } from 'utils/date';
import { useAppTranslation } from 'utils/i18n';
import { z } from 'zod';
import customerServices from 'services/customer-services';
import documentServices from 'services/document-services';
import {
  customerPersonSchema,
  emptyCustomerPerson,
  customerDocumentOwnerId,
  validateCustomerFile
} from './create-utils';

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
const normalizeApiText = (value?: unknown) =>
  String(value || '')
    .trim()
    .toLowerCase();

const optionalTextSchema = z.preprocess((value) => value ?? '', z.string().trim());

export const customerSchema = z.object({
  representative: customerPersonSchema.optional(),
  chiefAccountant: customerPersonSchema.optional(),
  contactPerson: customerPersonSchema.optional(),
  customerCode: z.string().trim().min(K_SIZE_1, { message: 'Vui lòng nhập mã khách hàng' }),
  fullName: optionalTextSchema,
  taxNo: optionalTextSchema
    .pipe(z.string().max(30, 'Mã số thuế không được quá 30 ký tự'))
    .refine((value) => !value || /^[A-Za-z0-9-]*$/.test(value), {
      message: 'Mã số thuế không hợp lệ'
    }),
  phone: optionalTextSchema.refine((value) => !value || /^\+?[0-9]{8,15}$/.test(value), {
    message: 'Số điện thoại không hợp lệ'
  }),
  email: optionalTextSchema
    .pipe(z.string().max(255, 'Email không được quá 255 ký tự'))
    .refine((value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), {
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

const optionalValue = (value?: string) => {
  const trimmedValue = value?.trim();
  return trimmedValue || undefined;
};

const updateTextValue = (value?: string) => value?.trim() || '';

const normalizeCustomerPerson = (person?: Customer['representative']) => ({
  fullName: person?.fullName || '',
  idNo: person?.idNo || '',
  phone: person?.phone || '',
  email: person?.email || ''
});

export const buildFormValues = (customer?: Customer): CustomerForm => ({
  representative: normalizeCustomerPerson(customer?.representative),
  chiefAccountant: normalizeCustomerPerson(customer?.chiefAccountant),
  contactPerson: normalizeCustomerPerson(
    customer?.contactPerson ?? {
      fullName: customer?.contactName,
      idNo: customer?.contactIdNo
    }
  ),
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

export const buildUpdateBody = (id: number, data: CustomerForm): UpdateCustomerReq => ({
  id,
  customerCode: data.customerCode.trim(),
  fullName: updateTextValue(data.fullName),
  taxNo: updateTextValue(data.taxNo),
  phone: updateTextValue(data.phone),
  email: updateTextValue(data.email),
  representative: data.representative,
  chiefAccountant: data.chiefAccountant,
  contactPerson: data.contactPerson,
  contactName: updateTextValue(data.contactPerson?.fullName ?? data.contactName),
  contactIdNo: updateTextValue(data.contactPerson?.idNo ?? data.contactIdNo),
  contactIssueDate: updateTextValue(normalizeDateToApi(data.contactIssueDate)),
  address: updateTextValue(data.address),
  operationUnitId: optionalValue(data.operationUnitId)
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
  const submittingRef = useRef<boolean>(false);
  const [saving, setSaving] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [createdCustomerId, setCreatedCustomerId] = useState<number>();

  const addFile = (file: File) => {
    const error = validateCustomerFile(file);
    if (error) {
      showToast({ type: TYPE_TOAST.ERROR, content: error });
      return;
    }
    setFiles((previous) => [...previous, file]);
  };
  const removeFile = (index: number) =>
    setFiles((previous) => previous.filter((_, i) => i !== index));

  const form = useForm<CustomerForm>({
    mode: 'onChange',
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
    form.reset({
      ...buildFormValues(),
      representative: emptyCustomerPerson(),
      chiefAccountant: emptyCustomerPerson(),
      contactPerson: emptyCustomerPerson()
    });
    setFiles([]);
    setCreatedCustomerId(undefined);
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
    if (submittingRef.current) return;
    setOpenForm(false);
    setFiles([]);
    setCreatedCustomerId(undefined);
    form.reset(buildFormValues());
  }, [form]);

  const buildCreateBody = useCallback(
    (data: CustomerForm): CreateCustomerReq => ({
      customerCode: data.customerCode.trim(),
      fullName: optionalValue(data.fullName),
      taxNo: optionalValue(data.taxNo),
      representative: data.representative,
      chiefAccountant: data.chiefAccountant,
      contactPerson: data.contactPerson,
      address: optionalValue(data.address),
      operationUnitId: optionalValue(data.operationUnitId)
    }),
    []
  );

  const handleSubmit = useCallback(
    async (data: CustomerForm) => {
      if (submittingRef.current) return;
      submittingRef.current = true;
      setSaving(true);
      try {
        let customerId = createdCustomerId;
        if (!customerId) {
          const response = await customerServices.createCustomer(buildCreateBody(data));
          if (hasApiError(response) || !response.data?.id) {
            throw new Error(getCustomerErrorMessage(response, 'Thêm mới khách hàng thất bại'));
          }
          customerId = response.data.id;
          setCreatedCustomerId(customerId);
          refreshFirstPage();
        }
        const ownerId = customerDocumentOwnerId(customerId);
        const failedFiles: File[] = [];
        for (const file of files) {
          try {
            const response = await documentServices.uploadDocument({
              file,
              ownerType: 'CUSTOMER',
              ownerId,
              docType: 'KHAC'
            });
            if (hasApiError(response) || !response.data) failedFiles.push(file);
          } catch {
            failedFiles.push(file);
          }
        }
        setFiles(failedFiles);
        if (failedFiles.length) {
          showToast({
            type: TYPE_TOAST.WARNING,
            content: `Khách hàng đã được tạo. ${failedFiles.length} tệp tải lên thất bại; bấm Thử lại tài liệu để tải lại.`
          });
          return;
        }
        setOpenForm(false);
        setCreatedCustomerId(undefined);
        form.reset(buildFormValues());
        showToast({ type: TYPE_TOAST.SUCCESS, content: 'Thêm mới khách hàng thành công' });
      } catch (error) {
        showToast({
          type: TYPE_TOAST.ERROR,
          content: error instanceof Error ? error.message : 'Thêm mới khách hàng thất bại'
        });
      } finally {
        submittingRef.current = false;
        setSaving(false);
      }
    },
    [buildCreateBody, createdCustomerId, files, form, refreshFirstPage]
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
    detailLoading: detailLoading || saving,
    files,
    addFile,
    removeFile,
    createdCustomerId,
    currentPage,
    pagination,
    filter,
    filterApplied,
    openForm,
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
