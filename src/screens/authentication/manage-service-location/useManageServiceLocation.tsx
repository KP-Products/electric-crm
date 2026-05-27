import { DEFAULT_PAGE_SIZE, K_SIZE_1 } from '@constant';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CREATE_SERVICE_LOCATION,
  DELETE_SERVICE_LOCATION,
  SEARCH_SERVICE_LOCATION,
  UPDATE_SERVICE_LOCATION
} from '@redux-action-type/service-location';
import { dispatch } from '@redux-common';
import {
  selectServiceLocationList,
  selectServiceLocationLoadingDetail,
  selectServiceLocationLoadingList,
  selectServiceLocationTotal
} from '@redux-selector/service-location';
import { showDialog } from 'components/dialog';
import { TYPE_ACTION, TYPE_MESSAGE } from 'components/dialog/type';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import { ErrorBase } from 'model/common';
import {
  CreateServiceLocationReq,
  DeleteServiceLocationReq,
  ServiceLocation,
  ServiceLocationSearchReq,
  UpdateServiceLocationReq
} from 'model/service-location';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import type {
  ServiceLocationFilterDrawerRef,
  ServiceLocationFilterForm
} from 'screens/authentication/manage-service-location/components/ServiceLocationFilterDrawer';
import { useAppTranslation } from 'utils/i18n';
import { z } from 'zod';

const serviceLocationSchema = z.object({
  contractId: z.string().trim().min(K_SIZE_1, { message: 'Vui lòng nhập mã hợp đồng' }),
  address: z.string().trim().min(K_SIZE_1, { message: 'Vui lòng nhập địa chỉ sử dụng điện' }),
  ward: z.string().trim().min(K_SIZE_1, { message: 'Vui lòng nhập phường/xã' }),
  voltageLevel: z.string().trim().min(K_SIZE_1, { message: 'Vui lòng chọn cấp điện áp' }),
  usagePurpose: z.string().trim().min(K_SIZE_1, { message: 'Vui lòng chọn mục đích sử dụng' }),
  meterId: z.string().trim(),
  unassignMeter: z.boolean()
});

export type ServiceLocationForm = z.infer<typeof serviceLocationSchema>;

const VOLTAGE_LEVEL_API_VALUE_MAP: Record<string, string> = {
  V_0_4_KV: 'V_0_4_KV',
  V_6_KV: 'V_6_KV',
  V_22_KV: 'V_22_KV',
  V_110_KV: 'V_110_KV',
  '0.4kV': 'V_0_4_KV',
  '6kV': 'V_6_KV',
  '22kV': 'V_22_KV',
  '110kV': 'V_110_KV'
};

const USAGE_PURPOSE_API_VALUE_MAP: Record<string, string> = {
  SINH_HOAT: 'SINH_HOAT',
  SAN_XUAT: 'SAN_XUAT',
  KINH_DOANH: 'KINH_DOANH',
  HC: 'HC',
  'Sinh hoạt': 'SINH_HOAT',
  'Sản xuất': 'SAN_XUAT',
  'Kinh doanh': 'KINH_DOANH'
};

const normalizeVoltageLevel = (voltageLevel: string) =>
  VOLTAGE_LEVEL_API_VALUE_MAP[voltageLevel] || voltageLevel;

const normalizeUsagePurpose = (usagePurpose: string) =>
  USAGE_PURPOSE_API_VALUE_MAP[usagePurpose] || usagePurpose;

export default function useManageServiceLocation() {
  const { t } = useAppTranslation();
  const serviceLocationList = useSelector(selectServiceLocationList);
  const total = useSelector(selectServiceLocationTotal);
  const listLoading = useSelector(selectServiceLocationLoadingList);
  const detailLoading = useSelector(selectServiceLocationLoadingDetail);

  const [currentPage, setCurrentPage] = useState<number>(K_SIZE_1);
  const [openForm, setOpenForm] = useState<boolean>(false);
  const [selectedLocation, setSelectedLocation] = useState<ServiceLocation>();
  const filterDrawerRef = useRef<ServiceLocationFilterDrawerRef>(null);

  const defaultFilter: ServiceLocationFilterForm = useMemo(
    () => ({
      keyword: '',
      contractId: '',
      customerId: '',
      voltageLevel: '',
      usagePurpose: ''
    }),
    []
  );
  const [filterApplied, setFilterApplied] = useState<ServiceLocationFilterForm>(defaultFilter);

  const form = useForm<ServiceLocationForm>({
    mode: 'onTouched',
    defaultValues: {
      contractId: '',
      address: '',
      ward: '',
      voltageLevel: '',
      usagePurpose: '',
      meterId: '',
      unassignMeter: false
    },
    resolver: zodResolver(serviceLocationSchema)
  });

  const buildSearchBody = useCallback(
    (filter: ServiceLocationFilterForm, page: number): ServiceLocationSearchReq => {
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
    (page: number) => {
      dispatch({
        type: SEARCH_SERVICE_LOCATION,
        payload: {
          body: buildSearchBody(filterApplied, page),
          onFailed: (error?: ErrorBase) => {
            showToast({
              type: TYPE_TOAST.ERROR,
              content:
                error?.businessErrorMessage ||
                error?.systemErrorMessage ||
                'Tải danh sách địa điểm thất bại'
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

  const onApplyFilter = useCallback((data: ServiceLocationFilterForm) => {
    setFilterApplied(data);
    setCurrentPage(K_SIZE_1);
  }, []);

  const onResetFilter = useCallback(
    (key?: keyof ServiceLocationFilterForm) => {
      if (key) {
        setFilterApplied((prev) => ({ ...prev, [key]: '' }));
      } else {
        setFilterApplied(defaultFilter);
      }
      setCurrentPage(K_SIZE_1);
    },
    [defaultFilter]
  );

  const onOpenCreate = useCallback(() => {
    setSelectedLocation(undefined);
    form.reset({
      contractId: '',
      address: '',
      ward: '',
      voltageLevel: '',
      usagePurpose: '',
      meterId: '',
      unassignMeter: false
    });
    setOpenForm(true);
  }, [form]);

  const onOpenUpdate = useCallback(
    (location: ServiceLocation) => {
      setSelectedLocation(location);
      form.reset({
        contractId: location.contractId || '',
        address: location.address || '',
        ward: location.ward || '',
        voltageLevel: normalizeVoltageLevel(location.voltageLevel || ''),
        usagePurpose: normalizeUsagePurpose(location.usagePurpose || ''),
        meterId: location.meterId || '',
        unassignMeter: false
      });
      setOpenForm(true);
    },
    [form]
  );

  const onCloseForm = useCallback(() => {
    setOpenForm(false);
    setSelectedLocation(undefined);
    form.reset();
  }, [form]);

  const onSubmitSuccess = useCallback(
    (content: string) => {
      onCloseForm();
      if (currentPage === K_SIZE_1) {
        fetchList(K_SIZE_1);
      } else {
        setCurrentPage(K_SIZE_1);
      }
      showToast({
        type: TYPE_TOAST.SUCCESS,
        content
      });
    },
    [currentPage, fetchList, onCloseForm]
  );

  const handleSubmit = useCallback(
    (data: ServiceLocationForm) => {
      if (selectedLocation) {
        const body: UpdateServiceLocationReq = {
          id: selectedLocation.id,
          address: data.address,
          ward: data.ward,
          voltageLevel: normalizeVoltageLevel(data.voltageLevel),
          usagePurpose: normalizeUsagePurpose(data.usagePurpose),
          meterId: data.unassignMeter ? undefined : data.meterId || undefined,
          unassignMeter: data.unassignMeter || undefined
        };

        dispatch({
          type: UPDATE_SERVICE_LOCATION,
          payload: {
            body,
            onSuccess: () => onSubmitSuccess('Cập nhật địa điểm thành công'),
            onFailed: (error?: ErrorBase) => {
              showToast({
                type: TYPE_TOAST.ERROR,
                content:
                  error?.businessErrorMessage ||
                  error?.systemErrorMessage ||
                  'Cập nhật địa điểm thất bại'
              });
            }
          }
        });
        return;
      }

      const body: CreateServiceLocationReq = {
        contractId: data.contractId,
        address: data.address,
        ward: data.ward,
        voltageLevel: normalizeVoltageLevel(data.voltageLevel),
        usagePurpose: normalizeUsagePurpose(data.usagePurpose),
        meterId: data.meterId || undefined
      };

      dispatch({
        type: CREATE_SERVICE_LOCATION,
        payload: {
          body,
          onSuccess: () => onSubmitSuccess('Thêm địa điểm thành công'),
          onFailed: (error?: ErrorBase) => {
            showToast({
              type: TYPE_TOAST.ERROR,
              content:
                error?.businessErrorMessage || error?.systemErrorMessage || 'Thêm địa điểm thất bại'
            });
          }
        }
      });
    },
    [onSubmitSuccess, selectedLocation]
  );

  const onDeleteSuccess = useCallback(() => {
    fetchList(currentPage);
    showToast({
      type: TYPE_TOAST.SUCCESS,
      content: 'Xoá địa điểm thành công'
    });
  }, [currentPage, fetchList]);

  const onDelete = useCallback(
    (location: ServiceLocation) => {
      showDialog({
        title: t('common:delete_confirm'),
        content: (
          <>
            Bạn có chắc chắn xoá địa điểm <strong>{location.address}</strong> này?
          </>
        ),
        type: TYPE_MESSAGE.ALERT,
        actions: [
          {
            title: t('common:agree'),
            type: TYPE_ACTION.PRIMARY,
            onPress: () => {
              const body: DeleteServiceLocationReq = { id: location.id };
              dispatch({
                type: DELETE_SERVICE_LOCATION,
                payload: {
                  body,
                  onSuccess: onDeleteSuccess,
                  onFailed: (error?: ErrorBase) => {
                    showToast({
                      type: TYPE_TOAST.ERROR,
                      content:
                        error?.businessErrorMessage ||
                        error?.systemErrorMessage ||
                        'Xoá địa điểm thất bại'
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
    serviceLocationList,
    total,
    listLoading,
    detailLoading,
    currentPage,
    pagination,
    defaultFilter,
    filterApplied,
    filterDrawerRef,
    onApplyFilter,
    onResetFilter,
    openForm,
    selectedLocation,
    form,
    handleSubmit,
    onOpenCreate,
    onOpenUpdate,
    onCloseForm,
    onDelete
  };
}
