import { DEFAULT_PAGE_SIZE, K_SIZE_0, K_SIZE_1 } from '@constant';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CREATE_OPERATION_PRICE,
  DELETE_OPERATION_PRICE,
  GET_OPERATION_PRICE_DETAIL,
  LOOKUP_OPERATION_PRICE_CONTRACT,
  SEARCH_OPERATION_PRICE,
  UPDATE_OPERATION_PRICE
} from '@redux-action-type/operation-price';
import { dispatch } from '@redux-common';
import {
  selectOperationPriceList,
  selectOperationPriceLoadingDetail,
  selectOperationPriceLoadingList,
  selectOperationPriceLoadingLookup,
  selectOperationPriceTotal
} from '@redux-selector/operation-price';
import { showDialog } from 'components/dialog';
import { TYPE_ACTION, TYPE_MESSAGE } from 'components/dialog/type';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import { ErrorBase } from 'model/common';
import {
  ContractLookupRes,
  CreateOperationPriceReq,
  OperationPrice,
  OperationPriceRes,
  SearchOperationPricesReq,
  UpdateOperationPriceReq
} from 'model/operation-price';
import moment from 'moment';
import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { FORMAT_DATE_API, normalizeDateToApi } from 'utils/date';
import { useAppTranslation } from 'utils/i18n';
import {
  formatIntegerWithCommas,
  isFormattedIntegerInput,
  parseFormattedIntegerNumber
} from 'utils/number-input';
import { z } from 'zod';

export const DATE_API_FORMAT = FORMAT_DATE_API;

export const OPERATION_PRICE_STATUS = {
  INACTIVE: 0,
  ACTIVE: 1
} as const;

const isSupportedOperationPriceStatus = (status: unknown): status is 0 | 1 =>
  status === OPERATION_PRICE_STATUS.INACTIVE || status === OPERATION_PRICE_STATUS.ACTIVE;

export const DEFAULT_OPERATION_PRICE_FILTER: OperationPriceFilter = {
  priceCode: '',
  priceName: '',
  status: '',
  effectiveFrom: '',
  effectiveTo: ''
};

const optionalTextSchema = z.preprocess((value) => value ?? '', z.string().trim());

const parseNumberInput = (value: string) => {
  return parseFormattedIntegerNumber(value) ?? Number.NaN;
};

const isValidNonNegativeNumber = (value: string) => {
  if (!value) return true;
  if (!isFormattedIntegerInput(value)) return false;
  const parsedValue = parseNumberInput(value);
  return Number.isFinite(parsedValue) && parsedValue >= K_SIZE_0;
};

const operationPriceSchema = z
  .object({
    priceName: z.string().trim().min(K_SIZE_1, { message: 'Vui lòng nhập tên đơn giá' }),
    contractNumber: z.string().trim().min(K_SIZE_1, {
      message: 'Vui lòng nhập số hợp đồng vận hành'
    }),
    customerCode: optionalTextSchema,
    customerName: optionalTextSchema,
    unitPrice: z
      .string()
      .trim()
      .min(K_SIZE_1, { message: 'Vui lòng nhập đơn giá' })
      .refine(isValidNonNegativeNumber, { message: 'Đơn giá không hợp lệ' }),
    discountType: optionalTextSchema,
    discountValue: optionalTextSchema.refine(isValidNonNegativeNumber, {
      message: 'Giá trị chiết khấu không hợp lệ'
    }),
    effectiveFrom: z.string().trim().min(K_SIZE_1, {
      message: 'Vui lòng chọn ngày hiệu lực từ'
    }),
    effectiveTo: optionalTextSchema,
    description: optionalTextSchema,
    status: z.union([z.number(), z.literal(''), z.undefined()]).optional()
  })
  .superRefine((data, context) => {
    if (data.discountType && !data.discountValue) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Vui lòng nhập giá trị chiết khấu',
        path: ['discountValue']
      });
    }

    if (!data.discountType && data.discountValue) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Vui lòng chọn loại chiết khấu',
        path: ['discountType']
      });
    }

    if (data.discountType === 'PERCENT' && parseNumberInput(data.discountValue) > 100) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Chiết khấu phần trăm không vượt quá 100',
        path: ['discountValue']
      });
    }

    if (
      data.effectiveFrom &&
      data.effectiveTo &&
      moment(data.effectiveTo, DATE_API_FORMAT).isBefore(
        moment(data.effectiveFrom, DATE_API_FORMAT)
      )
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Ngày hiệu lực đến không được trước ngày hiệu lực từ',
        path: ['effectiveTo']
      });
    }
  });

export interface OperationPriceFilter {
  priceCode: string;
  priceName: string;
  status: number | '';
  effectiveFrom: string;
  effectiveTo: string;
}

export type OperationPriceForm = z.infer<typeof operationPriceSchema>;

export const getOperationPriceErrorMessage = (
  error?: ErrorBase & { message?: string },
  fallback = 'Thao tác thất bại'
) =>
  error?.businessErrorMessage ||
  error?.systemErrorMessage ||
  error?.detailMessage ||
  error?.message ||
  fallback;

const normalizeStatusValue = (status?: number | string): number | '' => {
  if (status === OPERATION_PRICE_STATUS.ACTIVE || status === '1' || status === 'ACTIVE') {
    return OPERATION_PRICE_STATUS.ACTIVE;
  }

  if (status === OPERATION_PRICE_STATUS.INACTIVE || status === '0' || status === 'INACTIVE') {
    return OPERATION_PRICE_STATUS.INACTIVE;
  }

  return '';
};

const normalizeDateForForm = (date?: string) => {
  return normalizeDateToApi(date);
};

const buildFormValues = (operationPrice?: OperationPrice): OperationPriceForm => ({
  priceName: operationPrice?.priceName || '',
  contractNumber: operationPrice?.contractNumber || '',
  customerCode: operationPrice?.customerCode || '',
  customerName: operationPrice?.customerName || '',
  unitPrice:
    typeof operationPrice?.unitPrice === 'number' && Number.isFinite(operationPrice.unitPrice)
      ? formatIntegerWithCommas(operationPrice.unitPrice)
      : '',
  discountType: operationPrice?.discountType || '',
  discountValue:
    typeof operationPrice?.discountValue === 'number' &&
    Number.isFinite(operationPrice.discountValue)
      ? formatIntegerWithCommas(operationPrice.discountValue)
      : '',
  effectiveFrom: normalizeDateForForm(operationPrice?.effectiveFrom),
  effectiveTo: normalizeDateForForm(operationPrice?.effectiveTo),
  description: operationPrice?.description || '',
  status: normalizeStatusValue(operationPrice?.status)
});

export default function useOperationPrice() {
  const { t } = useAppTranslation();
  const operationPriceList = useSelector(selectOperationPriceList);
  const total = useSelector(selectOperationPriceTotal);
  const listLoading = useSelector(selectOperationPriceLoadingList);
  const detailLoading = useSelector(selectOperationPriceLoadingDetail);
  const lookupLoading = useSelector(selectOperationPriceLoadingLookup);

  const [currentPage, setCurrentPage] = useState<number>(K_SIZE_1);
  const [filter, setFilter] = useState<OperationPriceFilter>(DEFAULT_OPERATION_PRICE_FILTER);
  const [filterApplied, setFilterApplied] = useState<OperationPriceFilter>(
    DEFAULT_OPERATION_PRICE_FILTER
  );
  const [openForm, setOpenForm] = useState<boolean>(false);
  const [openDetail, setOpenDetail] = useState<boolean>(false);
  const [selectedOperationPrice, setSelectedOperationPrice] = useState<OperationPrice>();
  const [selectedDetail, setSelectedDetail] = useState<OperationPrice>();
  const submittingRef = useRef<boolean>(false);

  const form = useForm<OperationPriceForm>({
    mode: 'onTouched',
    defaultValues: buildFormValues(),
    resolver: zodResolver(operationPriceSchema)
  });

  const buildSearchBody = useCallback(
    (appliedFilter: OperationPriceFilter, page: number): SearchOperationPricesReq => ({
      page: page - K_SIZE_1,
      size: DEFAULT_PAGE_SIZE,
      priceCode: appliedFilter.priceCode.trim() || undefined,
      priceName: appliedFilter.priceName.trim() || undefined,
      status: isSupportedOperationPriceStatus(appliedFilter.status)
        ? appliedFilter.status
        : undefined,
      effectiveFrom: normalizeDateToApi(appliedFilter.effectiveFrom) || undefined,
      effectiveTo: normalizeDateToApi(appliedFilter.effectiveTo) || undefined
    }),
    []
  );

  const fetchList = useCallback(
    (page: number) => {
      dispatch({
        type: SEARCH_OPERATION_PRICE,
        payload: {
          body: buildSearchBody(filterApplied, page),
          onFailed: (error?: ErrorBase) => {
            showToast({
              type: TYPE_TOAST.ERROR,
              content: getOperationPriceErrorMessage(
                error,
                'Tải danh sách đơn giá vận hành thất bại'
              )
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
    if (operationPriceList.length === K_SIZE_1 && currentPage > K_SIZE_1) {
      setCurrentPage(currentPage - K_SIZE_1);
      return;
    }

    fetchList(currentPage);
  }, [currentPage, fetchList, operationPriceList.length]);

  const onChangeFilter = useCallback(
    (key: keyof OperationPriceFilter, value: OperationPriceFilter[keyof OperationPriceFilter]) => {
      setFilter((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const onApplyFilter = useCallback(() => {
    setFilterApplied(filter);
    setCurrentPage(K_SIZE_1);
  }, [filter]);

  const onResetFilter = useCallback((key?: keyof OperationPriceFilter) => {
    if (key) {
      setFilter((prev) => ({ ...prev, [key]: DEFAULT_OPERATION_PRICE_FILTER[key] }));
      setFilterApplied((prev) => ({ ...prev, [key]: DEFAULT_OPERATION_PRICE_FILTER[key] }));
    } else {
      setFilter(DEFAULT_OPERATION_PRICE_FILTER);
      setFilterApplied(DEFAULT_OPERATION_PRICE_FILTER);
    }
    setCurrentPage(K_SIZE_1);
  }, []);

  const onOpenCreate = useCallback(() => {
    setSelectedOperationPrice(undefined);
    form.reset(buildFormValues());
    setOpenForm(true);
  }, [form]);

  const onOpenUpdate = useCallback(
    (operationPrice: OperationPrice) => {
      setSelectedOperationPrice(operationPrice);
      form.reset(buildFormValues(operationPrice));
      setOpenForm(true);
    },
    [form]
  );

  const onCloseForm = useCallback(() => {
    setOpenForm(false);
    setSelectedOperationPrice(undefined);
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

  const buildCreateBody = useCallback((data: OperationPriceForm): CreateOperationPriceReq => {
    const discountType = data.discountType || undefined;

    return {
      priceName: data.priceName.trim(),
      contractNumber: data.contractNumber.trim(),
      unitPrice: parseNumberInput(data.unitPrice),
      discountType,
      discountValue: discountType ? parseNumberInput(data.discountValue) : undefined,
      effectiveFrom: normalizeDateToApi(data.effectiveFrom),
      effectiveTo: normalizeDateToApi(data.effectiveTo) || undefined,
      description: data.description.trim() || undefined
    };
  }, []);

  const buildUpdateBody = useCallback(
    (id: number, data: OperationPriceForm): UpdateOperationPriceReq => {
      const discountType = data.discountType || undefined;

      return {
        id,
        priceName: data.priceName.trim(),
        unitPrice: parseNumberInput(data.unitPrice),
        discountType: discountType || null,
        discountValue: discountType ? parseNumberInput(data.discountValue) : null,
        effectiveFrom: normalizeDateToApi(data.effectiveFrom),
        effectiveTo: normalizeDateToApi(data.effectiveTo) || null,
        description: data.description.trim() || null,
        status: isSupportedOperationPriceStatus(data.status) ? data.status : undefined
      };
    },
    []
  );

  const handleSubmit = useCallback(
    (data: OperationPriceForm) => {
      if (submittingRef.current) return;
      submittingRef.current = true;

      if (selectedOperationPrice) {
        if (!selectedOperationPrice.id) {
          submittingRef.current = false;
          showToast({
            type: TYPE_TOAST.ERROR,
            content: 'Không tìm thấy ID đơn giá vận hành để cập nhật'
          });
          return;
        }

        dispatch({
          type: UPDATE_OPERATION_PRICE,
          payload: {
            body: buildUpdateBody(selectedOperationPrice.id, data),
            onSuccess: () => onSubmitSuccess('Cập nhật đơn giá vận hành thành công'),
            onFailed: (error?: ErrorBase) => {
              submittingRef.current = false;
              showToast({
                type: TYPE_TOAST.ERROR,
                content: getOperationPriceErrorMessage(error, 'Cập nhật đơn giá vận hành thất bại')
              });
            }
          }
        });
        return;
      }

      dispatch({
        type: CREATE_OPERATION_PRICE,
        payload: {
          body: buildCreateBody(data),
          onSuccess: () => onSubmitSuccess('Thêm mới đơn giá vận hành thành công'),
          onFailed: (error?: ErrorBase) => {
            submittingRef.current = false;
            showToast({
              type: TYPE_TOAST.ERROR,
              content: getOperationPriceErrorMessage(error, 'Thêm mới đơn giá vận hành thất bại')
            });
          }
        }
      });
    },
    [buildCreateBody, buildUpdateBody, onSubmitSuccess, selectedOperationPrice]
  );

  const onLookupContract = useCallback(() => {
    const contractNumber = form.getValues('contractNumber').trim();

    if (!contractNumber) {
      showToast({
        type: TYPE_TOAST.ERROR,
        content: 'Vui lòng nhập số hợp đồng vận hành'
      });
      return;
    }

    dispatch({
      type: LOOKUP_OPERATION_PRICE_CONTRACT,
      payload: {
        body: { contractNumber },
        onSuccess: (response: ContractLookupRes) => {
          if (form.getValues('contractNumber').trim() !== contractNumber) return;

          const lookupData = response.data;
          if (!lookupData?.customerCode && !lookupData?.customerName) {
            form.setValue('customerCode', '', { shouldDirty: true });
            form.setValue('customerName', '', { shouldDirty: true });
            showToast({
              type: TYPE_TOAST.ERROR,
              content: 'Không tìm thấy thông tin khách hàng theo số hợp đồng'
            });
            return;
          }

          form.setValue('contractNumber', lookupData.contractNumber || contractNumber, {
            shouldDirty: true,
            shouldValidate: true
          });
          form.setValue('customerCode', lookupData.customerCode || '', { shouldDirty: true });
          form.setValue('customerName', lookupData.customerName || '', { shouldDirty: true });
        },
        onFailed: (error?: ErrorBase) => {
          if (form.getValues('contractNumber').trim() !== contractNumber) return;

          form.setValue('customerCode', '', { shouldDirty: true });
          form.setValue('customerName', '', { shouldDirty: true });
          showToast({
            type: TYPE_TOAST.ERROR,
            content: getOperationPriceErrorMessage(error, 'Tra cứu hợp đồng vận hành thất bại')
          });
        }
      }
    });
  }, [form]);

  const onChangeContractNumber = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      form.setValue('contractNumber', event.target.value, {
        shouldDirty: true,
        shouldValidate: true
      });
      form.setValue('customerCode', '', { shouldDirty: true });
      form.setValue('customerName', '', { shouldDirty: true });
    },
    [form]
  );

  const onOpenDetail = useCallback((operationPrice: OperationPrice) => {
    setSelectedDetail(operationPrice);
    setOpenDetail(true);

    dispatch({
      type: GET_OPERATION_PRICE_DETAIL,
      payload: {
        body: { id: operationPrice.id },
        onSuccess: (response: OperationPriceRes) => {
          setSelectedDetail(response.data);
        },
        onFailed: (error?: ErrorBase) => {
          showToast({
            type: TYPE_TOAST.ERROR,
            content: getOperationPriceErrorMessage(error, 'Tải chi tiết đơn giá vận hành thất bại')
          });
        }
      }
    });
  }, []);

  const onCloseDetail = useCallback(() => {
    setOpenDetail(false);
    setSelectedDetail(undefined);
  }, []);

  const onDeleteSuccess = useCallback(() => {
    refreshAfterDelete();
    showToast({
      type: TYPE_TOAST.SUCCESS,
      content: 'Xoá đơn giá vận hành thành công'
    });
  }, [refreshAfterDelete]);

  const onDelete = useCallback(
    (operationPrice: OperationPrice) => {
      showDialog({
        title: t('common:delete_confirm'),
        content: (
          <>
            Bạn có chắc chắn xoá đơn giá vận hành{' '}
            <strong>{operationPrice.priceCode || operationPrice.priceName}</strong> này?
          </>
        ),
        type: TYPE_MESSAGE.ALERT,
        actions: [
          {
            title: t('common:agree'),
            type: TYPE_ACTION.PRIMARY,
            onPress: () => {
              dispatch({
                type: DELETE_OPERATION_PRICE,
                payload: {
                  body: { id: operationPrice.id },
                  onSuccess: onDeleteSuccess,
                  onFailed: (error?: ErrorBase) => {
                    showToast({
                      type: TYPE_TOAST.ERROR,
                      content: getOperationPriceErrorMessage(error, 'Xoá đơn giá vận hành thất bại')
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
    operationPriceList,
    total,
    listLoading,
    detailLoading,
    lookupLoading,
    currentPage,
    pagination,
    filter,
    filterApplied,
    openForm,
    openDetail,
    selectedOperationPrice,
    selectedDetail,
    form,
    onChangeFilter,
    onApplyFilter,
    onResetFilter,
    onOpenCreate,
    onOpenUpdate,
    onCloseForm,
    handleSubmit,
    onLookupContract,
    onChangeContractNumber,
    onOpenDetail,
    onCloseDetail,
    onDelete
  };
}
