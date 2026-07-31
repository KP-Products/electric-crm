import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { z } from 'zod';
import { K_SIZE_1 } from '@constant';
import { dispatch } from '@redux-common';
import {
  CREATE_MEASURING_DEVICE,
  GET_MEASURING_DEVICE_DETAIL,
  UPDATE_MEASURING_DEVICE
} from '@redux-action-type/measuring-device';
import { selectMeasuringDeviceLoadingDetail } from '@redux-selector/measuring-device';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import { ROUTES } from 'config/routes';
import { ErrorBase } from 'model/common';
import { MeasuringDevice, MeasuringDeviceRes } from 'model/measuring-device';
import moment from 'moment';
import { API_DATE_INPUT_FORMATS } from 'utils/date';
import {
  buildCreateBody,
  buildUpdateBody,
  defaultDeviceForm,
  getDeviceError,
  toForm
} from '../utils';

export interface MeasuringDeviceFilter {
  deviceCode: string;
  serialNumber: string;
  deviceType: string;
  status: string;
}
export interface MeasuringDeviceForm {
  deviceCode: string;
  serialNumber: string;
  deviceType: string;
  manufacturer: string;
  model: string;
  ratio: string;
  accuracyClass: string;
  purchaseDate: string;
  installedDate: string;
  inspectionDate: string;
  inspectionDueDate: string;
  status: string;
  note: string;
}
export interface MeasuringDeviceFormProps {
  isAddMode: boolean;
  isView: boolean;
}

const optional = z.preprocess((value) => value ?? '', z.string().trim());
const parseDate = (value: string) =>
  value ? moment(value, API_DATE_INPUT_FORMATS, true) : undefined;
const schema = z
  .object({
    deviceCode: z.string().trim().min(K_SIZE_1, 'Vui lòng nhập mã TU/TI'),
    ratio: z.string().trim().min(K_SIZE_1, 'Vui lòng nhập tỷ số biến'),
    serialNumber: optional,
    deviceType: optional,
    manufacturer: optional,
    model: optional,
    accuracyClass: optional,
    purchaseDate: optional,
    installedDate: optional,
    inspectionDate: optional,
    inspectionDueDate: optional,
    status: optional,
    note: optional
  })
  .superRefine((data, context) => {
    const purchaseDate = parseDate(data.purchaseDate);
    const installedDate = parseDate(data.installedDate);
    const inspectionDate = parseDate(data.inspectionDate);
    const inspectionDueDate = parseDate(data.inspectionDueDate);

    if (purchaseDate && !purchaseDate.isValid()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['purchaseDate'],
        message: 'Ngày mua không hợp lệ'
      });
    }
    if (installedDate && !installedDate.isValid()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['installedDate'],
        message: 'Ngày lắp đặt không hợp lệ'
      });
    }
    if (inspectionDate && !inspectionDate.isValid()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['inspectionDate'],
        message: 'Ngày kiểm định không hợp lệ'
      });
    }
    if (inspectionDueDate && !inspectionDueDate.isValid()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['inspectionDueDate'],
        message: 'Ngày đến hạn kiểm định không hợp lệ'
      });
    }
    if (
      purchaseDate?.isValid() &&
      installedDate?.isValid() &&
      installedDate.isBefore(purchaseDate, 'day')
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['installedDate'],
        message: 'Ngày lắp đặt không được trước ngày mua'
      });
    }
    if (
      inspectionDate?.isValid() &&
      inspectionDueDate?.isValid() &&
      inspectionDueDate.isBefore(inspectionDate, 'day')
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['inspectionDueDate'],
        message: 'Ngày đến hạn kiểm định không được trước ngày kiểm định'
      });
    }
  });

export default function useMeasuringDeviceForm({ isAddMode, isView }: MeasuringDeviceFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = Number(searchParams.get('id'));
  const loading = useSelector(selectMeasuringDeviceLoadingDetail);
  const [device, setDevice] = useState<MeasuringDevice>();
  const form = useForm<MeasuringDeviceForm>({
    mode: 'onTouched',
    defaultValues: defaultDeviceForm,
    resolver: zodResolver(schema)
  });
  const title = useMemo(
    () => (isAddMode ? 'Thêm mới TU/TI' : isView ? 'Chi tiết TU/TI' : 'Cập nhật TU/TI'),
    [isAddMode, isView]
  );
  useEffect(() => {
    if (isAddMode) {
      form.reset(defaultDeviceForm);
      return;
    }
    if (!Number.isInteger(id) || id <= 0) {
      router.replace(ROUTES.MEASURING_DEVICE_MANAGEMENT);
      return;
    }
    dispatch({
      type: GET_MEASURING_DEVICE_DETAIL,
      payload: {
        body: { id },
        onSuccess: (res: MeasuringDeviceRes) => {
          if (res.data) {
            setDevice(res.data);
            form.reset(toForm(res.data));
          }
        },
        onFailed: (error?: ErrorBase) => {
          showToast({
            type: TYPE_TOAST.ERROR,
            content: getDeviceError(error, 'Tải chi tiết TU/TI thất bại')
          });
          router.replace(ROUTES.MEASURING_DEVICE_MANAGEMENT);
        }
      }
    });
  }, [form, id, isAddMode, router]);
  const submit = useCallback(
    (data: MeasuringDeviceForm) => {
      const onSuccess = () => {
        showToast({
          type: TYPE_TOAST.SUCCESS,
          content: isAddMode ? 'Thêm mới TU/TI thành công' : 'Cập nhật TU/TI thành công'
        });
        router.push(ROUTES.MEASURING_DEVICE_MANAGEMENT);
      };
      const onFailed = (error?: ErrorBase) =>
        showToast({
          type: TYPE_TOAST.ERROR,
          content: getDeviceError(
            error,
            isAddMode ? 'Thêm mới TU/TI thất bại' : 'Cập nhật TU/TI thất bại'
          )
        });
      if (isAddMode)
        dispatch({
          type: CREATE_MEASURING_DEVICE,
          payload: { body: buildCreateBody(data), onSuccess, onFailed }
        });
      else if (Number.isInteger(id) && id > 0)
        dispatch({
          type: UPDATE_MEASURING_DEVICE,
          payload: { body: buildUpdateBody(id, data), onSuccess, onFailed }
        });
    },
    [id, isAddMode, router]
  );
  return { form, title, loading, isView, isAddMode, device, submit, onBack: () => router.back() };
}
