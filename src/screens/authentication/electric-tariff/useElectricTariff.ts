import { DEFAULT_PAGE_SIZE, K_SIZE_0, K_SIZE_1 } from '@constant';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CREATE_ELECTRIC_TARIFF,
  CREATE_ELECTRIC_TARIFF_TOU_PRICE,
  GET_ELECTRIC_TARIFF_DETAIL,
  SEARCH_ELECTRIC_TARIFF
} from '@redux-action-type/electric-tariff';
import { dispatch } from '@redux-common';
import {
  selectElectricTariffList,
  selectElectricTariffLoadingDetail,
  selectElectricTariffLoadingList,
  selectElectricTariffTotal
} from '@redux-selector/electric-tariff';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import {
  CreateTariffReq,
  CreateTouPriceReq,
  ElectricTariff,
  ElectricTariffTouPrice,
  GetTariffDetailRes,
  SearchTariffsReq,
  TariffDetail
} from 'model/electric-tariff';
import moment from 'moment';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { z } from 'zod';

export const TARIFF_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE'
};

export const DEFAULT_TARIFF_FILTER: ElectricTariffFilter = {
  tariffCode: '',
  tariffName: '',
  customerType: '',
  voltageLevel: '',
  status: ''
};

const DATE_API_FORMAT = 'YYYY-MM-DD';
const VAT_RATE = 0.1;
const optionalTextSchema = z.preprocess((value) => value ?? '', z.string().trim());

const tariffSchema = z.object({
  tariffCode: z.string().trim().min(K_SIZE_1, { message: 'Vui lòng nhập mã giá' }),
  tariffName: z.string().trim().min(K_SIZE_1, { message: 'Vui lòng nhập tên giá' }),
  customerType: z.string().trim().min(K_SIZE_1, { message: 'Vui lòng chọn mục đích sử dụng' }),
  voltageLevel: z.string().trim().min(K_SIZE_1, { message: 'Vui lòng chọn cấp điện áp' }),
  effectiveFrom: z.string().trim().min(K_SIZE_1, { message: 'Vui lòng chọn ngày hiệu lực' }),
  effectiveTo: optionalTextSchema,
  status: z.string().trim()
});

const parseNumber = (value: string) => Number(value.trim().replace(',', '.'));

const touPriceSchema = z.object({
  tou: z.string().trim().min(K_SIZE_1, { message: 'Vui lòng nhập bậc/khung giờ' }),
  unitPrice: z
    .string()
    .trim()
    .min(K_SIZE_1, { message: 'Vui lòng nhập đơn giá' })
    .refine((value) => Number.isFinite(parseNumber(value)) && parseNumber(value) >= K_SIZE_0, {
      message: 'Đơn giá không hợp lệ'
    }),
  voltageLevel: optionalTextSchema,
  effectiveFrom: optionalTextSchema,
  effectiveTo: optionalTextSchema
});

const getErrorMessage = (error?: any, fallback = 'Thao tác thất bại') => {
  return (
    error?.businessErrorMessage ||
    error?.systemErrorMessage ||
    error?.detailMessage ||
    error?.message ||
    fallback
  );
};

export interface ElectricTariffFilter {
  tariffCode: string;
  tariffName: string;
  customerType: string;
  voltageLevel: string;
  status: string;
}

export type ElectricTariffForm = z.infer<typeof tariffSchema>;
export type TouPriceForm = z.infer<typeof touPriceSchema>;

export const getPriceWithVat = (unitPrice?: number) =>
  typeof unitPrice === 'number' && Number.isFinite(unitPrice)
    ? Math.round(unitPrice * (K_SIZE_1 + VAT_RATE))
    : undefined;

export default function useElectricTariff() {
  const tariffList = useSelector(selectElectricTariffList);
  const total = useSelector(selectElectricTariffTotal);
  const listLoading = useSelector(selectElectricTariffLoadingList);
  const detailLoading = useSelector(selectElectricTariffLoadingDetail);
  const [currentPage, setCurrentPage] = useState<number>(K_SIZE_1);
  const [filterDraft, setFilterDraft] = useState<ElectricTariffFilter>(DEFAULT_TARIFF_FILTER);
  const [filterApplied, setFilterApplied] = useState<ElectricTariffFilter>(DEFAULT_TARIFF_FILTER);
  const [openCreate, setOpenCreate] = useState<boolean>(false);
  const [openDetail, setOpenDetail] = useState<boolean>(false);
  const [openTouForm, setOpenTouForm] = useState<boolean>(false);
  const [selectedDetail, setSelectedDetail] = useState<TariffDetail>();
  const [touTargetTariff, setTouTargetTariff] = useState<ElectricTariff>();
  const [touPrices, setTouPrices] = useState<ElectricTariffTouPrice[]>([]);

  const tariffForm = useForm<ElectricTariffForm>({
    mode: 'onTouched',
    defaultValues: {
      tariffCode: '',
      tariffName: '',
      customerType: 'SINH_HOAT',
      voltageLevel: 'V_0_4_KV',
      effectiveFrom: moment().format(DATE_API_FORMAT),
      effectiveTo: '',
      status: TARIFF_STATUS.ACTIVE
    },
    resolver: zodResolver(tariffSchema)
  });

  const touPriceForm = useForm<TouPriceForm>({
    mode: 'onTouched',
    defaultValues: {
      tou: '',
      unitPrice: '',
      voltageLevel: '',
      effectiveFrom: '',
      effectiveTo: ''
    },
    resolver: zodResolver(touPriceSchema)
  });

  const buildSearchBody = useCallback(
    (filter: ElectricTariffFilter, page: number): SearchTariffsReq => {
      const normalizedFilter = Object.fromEntries(
        Object.entries(filter)
          .map(([key, value]) => [key, value.trim()])
          .filter(([, value]) => Boolean(value))
      );

      return {
        page: page - K_SIZE_1,
        size: DEFAULT_PAGE_SIZE,
        ...normalizedFilter
      };
    },
    []
  );

  const fetchList = useCallback(
    (page: number, filter: ElectricTariffFilter) => {
      dispatch({
        type: SEARCH_ELECTRIC_TARIFF,
        payload: {
          body: buildSearchBody(filter, page),
          onFailed: (error?: unknown) => {
            showToast({
              type: TYPE_TOAST.ERROR,
              content: getErrorMessage(error, 'Tải danh mục giá điện thất bại')
            });
          }
        }
      });
    },
    [buildSearchBody]
  );

  useEffect(() => {
    fetchList(currentPage, filterApplied);
  }, [currentPage, fetchList, filterApplied]);

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

  const onChangeFilter = useCallback((key: keyof ElectricTariffFilter, value: string) => {
    setFilterDraft((prev) => ({ ...prev, [key]: value }));
  }, []);

  const onApplyFilter = useCallback(() => {
    setFilterApplied(filterDraft);
    setCurrentPage(K_SIZE_1);
  }, [filterDraft]);

  const onResetFilter = useCallback(() => {
    setFilterDraft(DEFAULT_TARIFF_FILTER);
    setFilterApplied(DEFAULT_TARIFF_FILTER);
    setCurrentPage(K_SIZE_1);
  }, []);

  const onOpenCreate = useCallback(() => {
    tariffForm.reset({
      tariffCode: '',
      tariffName: '',
      customerType: 'SINH_HOAT',
      voltageLevel: 'V_0_4_KV',
      effectiveFrom: moment().format(DATE_API_FORMAT),
      effectiveTo: '',
      status: TARIFF_STATUS.ACTIVE
    });
    setOpenCreate(true);
  }, [tariffForm]);

  const onCloseCreate = useCallback(() => {
    setOpenCreate(false);
    tariffForm.reset();
  }, [tariffForm]);

  const refreshFirstPage = useCallback(() => {
    if (currentPage === K_SIZE_1) {
      fetchList(K_SIZE_1, filterApplied);
    } else {
      setCurrentPage(K_SIZE_1);
    }
  }, [currentPage, fetchList, filterApplied]);

  const handleCreateTariff = useCallback(
    (data: ElectricTariffForm) => {
      const body: CreateTariffReq = {
        tariffCode: data.tariffCode.trim(),
        tariffName: data.tariffName.trim(),
        customerType: data.customerType,
        voltageLevel: data.voltageLevel,
        effectiveFrom: data.effectiveFrom,
        effectiveTo: data.effectiveTo || undefined,
        status: data.status || TARIFF_STATUS.ACTIVE
      };

      dispatch({
        type: CREATE_ELECTRIC_TARIFF,
        payload: {
          body,
          onSuccess: () => {
            showToast({
              type: TYPE_TOAST.SUCCESS,
              content: 'Thêm biểu giá điện thành công'
            });
            onCloseCreate();
            refreshFirstPage();
          },
          onFailed: (error?: unknown) => {
            showToast({
              type: TYPE_TOAST.ERROR,
              content: getErrorMessage(error, 'Thêm biểu giá điện thất bại')
            });
          }
        }
      });
    },
    [onCloseCreate, refreshFirstPage]
  );

  const loadTariffDetail = useCallback((id: number) => {
    dispatch({
      type: GET_ELECTRIC_TARIFF_DETAIL,
      payload: {
        body: { id },
        onSuccess: (response: GetTariffDetailRes) => {
          setSelectedDetail(response.data);
          setTouPrices(response.data?.touPrices || []);
        },
        onFailed: (error?: unknown) => {
          showToast({
            type: TYPE_TOAST.ERROR,
            content: getErrorMessage(error, 'Tải chi tiết biểu giá thất bại')
          });
        }
      }
    });
  }, []);

  const onOpenDetail = useCallback(
    (tariff: ElectricTariff) => {
      setSelectedDetail({ tariff, touPrices: [] });
      setTouPrices([]);
      setOpenDetail(true);
      loadTariffDetail(tariff.id);
    },
    [loadTariffDetail]
  );

  const onCloseDetail = useCallback(() => {
    setOpenDetail(false);
    setSelectedDetail(undefined);
    setTouPrices([]);
  }, []);

  const onOpenTouCreate = useCallback(
    (tariff?: ElectricTariff) => {
      const targetTariff = tariff || selectedDetail?.tariff;
      if (!targetTariff) return;

      setTouTargetTariff(targetTariff);
      touPriceForm.reset({
        tou: '',
        unitPrice: '',
        voltageLevel: targetTariff.voltageLevel || '',
        effectiveFrom: targetTariff.effectiveFrom || '',
        effectiveTo: targetTariff.effectiveTo || ''
      });
      setOpenTouForm(true);
    },
    [selectedDetail?.tariff, touPriceForm]
  );

  const onCloseTouForm = useCallback(() => {
    setOpenTouForm(false);
    setTouTargetTariff(undefined);
    touPriceForm.reset();
  }, [touPriceForm]);

  const handleCreateTouPrice = useCallback(
    (data: TouPriceForm) => {
      if (!touTargetTariff) return;

      const body: CreateTouPriceReq = {
        tariffId: touTargetTariff.id,
        tou: data.tou.trim(),
        unitPrice: parseNumber(data.unitPrice),
        voltageLevel: data.voltageLevel || undefined,
        effectiveFrom: data.effectiveFrom || undefined,
        effectiveTo: data.effectiveTo || undefined
      };

      dispatch({
        type: CREATE_ELECTRIC_TARIFF_TOU_PRICE,
        payload: {
          body,
          onSuccess: () => {
            showToast({
              type: TYPE_TOAST.SUCCESS,
              content: 'Thêm bậc giá thành công'
            });
            onCloseTouForm();

            if (openDetail && selectedDetail?.tariff?.id) {
              loadTariffDetail(selectedDetail.tariff.id);
            }
          },
          onFailed: (error?: unknown) => {
            showToast({
              type: TYPE_TOAST.ERROR,
              content: getErrorMessage(error, 'Thêm bậc giá thất bại')
            });
          }
        }
      });
    },
    [loadTariffDetail, onCloseTouForm, openDetail, selectedDetail?.tariff?.id, touTargetTariff]
  );

  return {
    tariffList,
    total,
    currentPage,
    pagination,
    filterDraft,
    filterApplied,
    listLoading,
    detailLoading,
    openCreate,
    openDetail,
    openTouForm,
    selectedDetail,
    touTargetTariff,
    touPrices,
    tariffForm,
    touPriceForm,
    onChangeFilter,
    onApplyFilter,
    onResetFilter,
    onOpenCreate,
    onCloseCreate,
    handleCreateTariff,
    onOpenDetail,
    onCloseDetail,
    onOpenTouCreate,
    onCloseTouForm,
    handleCreateTouPrice
  };
}
