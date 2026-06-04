import { DEFAULT_PAGE_SIZE, K_SIZE_0, K_SIZE_1 } from '@constant';
import { zodResolver } from '@hookform/resolvers/zod';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import {
  CreateTariffReq,
  CreateTouPriceReq,
  ElectricTariff,
  ElectricTariffTouPrice,
  SearchTariffsReq,
  TariffDetail
} from 'model/electric-tariff';
import moment from 'moment';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import electricTariffServices from 'services/electric-tariff-services';
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
  const [tariffList, setTariffList] = useState<ElectricTariff[]>([]);
  const [total, setTotal] = useState<number>(K_SIZE_0);
  const [currentPage, setCurrentPage] = useState<number>(K_SIZE_1);
  const [filterDraft, setFilterDraft] = useState<ElectricTariffFilter>(DEFAULT_TARIFF_FILTER);
  const [filterApplied, setFilterApplied] = useState<ElectricTariffFilter>(DEFAULT_TARIFF_FILTER);
  const [listLoading, setListLoading] = useState<boolean>(false);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);
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
    async (page: number, filter: ElectricTariffFilter) => {
      setListLoading(true);
      const response = await electricTariffServices.searchTariffs(buildSearchBody(filter, page));
      setListLoading(false);

      if (!response?.data) {
        showToast({
          type: TYPE_TOAST.ERROR,
          content: getErrorMessage(response, 'Tải danh mục giá điện thất bại')
        });
        return;
      }

      setTariffList(response.data.items || []);
      setTotal(response.data.total || K_SIZE_0);
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
    async (data: ElectricTariffForm) => {
      const body: CreateTariffReq = {
        tariffCode: data.tariffCode.trim(),
        tariffName: data.tariffName.trim(),
        customerType: data.customerType,
        voltageLevel: data.voltageLevel,
        effectiveFrom: data.effectiveFrom,
        effectiveTo: data.effectiveTo || undefined,
        status: data.status || TARIFF_STATUS.ACTIVE
      };

      setDetailLoading(true);
      const response = await electricTariffServices.createTariff(body);
      setDetailLoading(false);

      if (!response?.data) {
        showToast({
          type: TYPE_TOAST.ERROR,
          content: getErrorMessage(response, 'Thêm biểu giá điện thất bại')
        });
        return;
      }

      showToast({
        type: TYPE_TOAST.SUCCESS,
        content: 'Thêm biểu giá điện thành công'
      });
      onCloseCreate();
      refreshFirstPage();
    },
    [onCloseCreate, refreshFirstPage]
  );

  const loadTariffDetail = useCallback(async (id: number) => {
    setDetailLoading(true);
    const response = await electricTariffServices.getTariffDetail({ id });
    setDetailLoading(false);

    if (!response?.data) {
      showToast({
        type: TYPE_TOAST.ERROR,
        content: getErrorMessage(response, 'Tải chi tiết biểu giá thất bại')
      });
      return;
    }

    setSelectedDetail(response.data);
    setTouPrices(response.data.touPrices || []);
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
    async (data: TouPriceForm) => {
      if (!touTargetTariff) return;

      const body: CreateTouPriceReq = {
        tariffId: touTargetTariff.id,
        tou: data.tou.trim(),
        unitPrice: parseNumber(data.unitPrice),
        voltageLevel: data.voltageLevel || undefined,
        effectiveFrom: data.effectiveFrom || undefined,
        effectiveTo: data.effectiveTo || undefined
      };

      setDetailLoading(true);
      const response = await electricTariffServices.createTouPrice(body);
      setDetailLoading(false);

      if (!response?.data) {
        showToast({
          type: TYPE_TOAST.ERROR,
          content: getErrorMessage(response, 'Thêm bậc giá thất bại')
        });
        return;
      }

      showToast({
        type: TYPE_TOAST.SUCCESS,
        content: 'Thêm bậc giá thành công'
      });
      onCloseTouForm();

      if (openDetail && selectedDetail?.tariff?.id) {
        loadTariffDetail(selectedDetail.tariff.id);
      }
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
