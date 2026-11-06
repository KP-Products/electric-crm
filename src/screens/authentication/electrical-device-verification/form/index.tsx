'use client';

import { PlusOutlined } from '@ant-design/icons';
import { K_SIZE_8 } from '@constant';
import { Button, Flex, Input, Modal, Spin } from 'antd';
import ButtonBase from 'components/button';
import { AppDatePickerControl } from 'components/date-picker';
import { AppSelect, AppSelectControl } from 'components/select';
import { AppTextField, AppTextFieldControl } from 'components/text-field';
import { TYPE_TOAST } from 'components/toast/type';
import { showToast } from 'components/toast';
import { ROUTES } from 'config/routes';
import PageWithBreadcrumb from 'layout/AppLayout/PageWithBreadcumb';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CreateInspectionLocationReq,
  InspectionLocation,
  MasterDevice
} from 'model/electrical-device';
import { ErrorBase } from 'model/common';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import electricalDeviceServices from 'services/electrical-device-services';
import { API_DATE_INPUT_FORMATS, FORMAT_DATE_API } from 'utils/date';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import {
  getElectricalDeviceError,
  hasVerificationRequirement,
  LOCATION_TYPE_OPTIONS,
  normalizeInspectionDate
} from '../utils';

dayjs.extend(customParseFormat);

const required = <span className="text-error-600">*</span>;

const formSchema = z.object({
  deviceCode: z.string().trim(),
  deviceName: z.string().trim(),
  deviceType: z.string().trim().min(1, 'Vui lòng chọn loại thiết bị'),
  serialNumber: z.string().trim(),
  manufacturer: z.string().trim(),
  supplier: z.string().trim(),
  locationId: z.string().trim().min(1, 'Vui lòng chọn địa điểm lắp đặt'),
  status: z.string().trim(),
  notes: z.string().trim(),
  verificationDate: z.string().trim(),
  certificateNo: z.string().trim(),
  resultStatus: z.string().trim(),
  nextVerificationDate: z.string().trim(),
  verificationNotes: z.string().trim()
});

type DeviceForm = z.infer<typeof formSchema>;
const defaultValues: DeviceForm = {
  deviceCode: '',
  deviceName: '',
  deviceType: '',
  serialNumber: '',
  manufacturer: '',
  supplier: '',
  locationId: '',
  status: 'ACTIVE',
  notes: '',
  verificationDate: '',
  certificateNo: '',
  resultStatus: 'PASS',
  nextVerificationDate: '',
  verificationNotes: ''
};

export interface ElectricalDeviceFormScreenProps {
  mode: 'add' | 'edit';
}

export default function ElectricalDeviceFormScreen({ mode }: ElectricalDeviceFormScreenProps) {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get('id') || '';
  const isAdd = mode === 'add';
  const [loading, setLoading] = useState(!isAdd);
  const [saving, setSaving] = useState(false);
  const [deviceTypes, setDeviceTypes] = useState<MasterDevice[]>([]);
  const [locations, setLocations] = useState<InspectionLocation[]>([]);
  const [selectedFile, setSelectedFile] = useState<File>();
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [locationName, setLocationName] = useState('');
  const [locationType, setLocationType] = useState('METERING_STATION');
  const [locationDescription, setLocationDescription] = useState('');
  const [creatingLocation, setCreatingLocation] = useState(false);
  const form = useForm<DeviceForm>({
    mode: 'onTouched',
    defaultValues,
    resolver: zodResolver(formSchema)
  });
  const { control, handleSubmit, watch, setValue, formState } = form;
  const selectedDeviceType = watch('deviceType');
  const verificationDate = watch('verificationDate');
  const selectedType = useMemo(
    () => deviceTypes.find((item) => item.id === selectedDeviceType),
    [deviceTypes, selectedDeviceType]
  );
  const needsVerification = hasVerificationRequirement(selectedType?.hasverification);

  useEffect(() => {
    let active = true;
    const loadOptions = async () => {
      const [typeResponse, locationResponse] = await Promise.all([
        electricalDeviceServices.searchMasterDevices({ page: 0, size: 100, status: 'ACTIVE' }),
        electricalDeviceServices.searchInspectionLocations({ page: 0, size: 100, status: 'ACTIVE' })
      ]);
      if (!active) return;
      setDeviceTypes(typeResponse?.data?.items || []);
      setLocations(locationResponse?.data?.items || []);
    };
    void loadOptions();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (isAdd) {
      setLoading(false);
      form.reset(defaultValues);
      return;
    }
    if (!id) {
      router.replace(ROUTES.ELECTRICAL_DEVICE_VERIFICATION);
      return;
    }
    let active = true;
    const loadDevice = async () => {
      setLoading(true);
      const response = await electricalDeviceServices.getElectricalDeviceDetail({ id });
      if (!active) return;
      setLoading(false);
      if (!response?.data) {
        showToast({
          type: TYPE_TOAST.ERROR,
          content: getElectricalDeviceError(response as ErrorBase, 'Tải chi tiết thiết bị thất bại')
        });
        router.replace(ROUTES.ELECTRICAL_DEVICE_VERIFICATION);
        return;
      }
      const device = response.data;
      form.reset({
        ...defaultValues,
        deviceCode: device.deviceCode || '',
        deviceName: device.deviceName || '',
        deviceType: device.deviceType || '',
        serialNumber: device.serialNumber || '',
        manufacturer: device.manufacturer || '',
        supplier: device.supplier || '',
        locationId: device.locationId ? String(device.locationId) : '',
        status: device.status || 'ACTIVE',
        notes: device.notes || ''
      });
    };
    void loadDevice();
    return () => {
      active = false;
    };
  }, [form, id, isAdd, router]);

  useEffect(() => {
    if (!isAdd || !needsVerification || !verificationDate || !selectedType?.inspectionCycleMonths) {
      return;
    }
    const parsed = dayjs(verificationDate, API_DATE_INPUT_FORMATS, true);
    if (!parsed.isValid()) return;
    setValue(
      'nextVerificationDate',
      parsed.add(selectedType.inspectionCycleMonths, 'month').format(FORMAT_DATE_API),
      { shouldDirty: true, shouldValidate: true }
    );
  }, [isAdd, needsVerification, selectedType, setValue, verificationDate]);

  const locationOptions = useMemo(
    () =>
      locations.map((location) => ({
        value: String(location.id),
        label: location.locationName || `Điểm ${location.id}`
      })),
    [locations]
  );

  const createLocation = useCallback(async () => {
    if (!locationName.trim()) {
      showToast({ type: TYPE_TOAST.ERROR, content: 'Vui lòng nhập tên điểm lắp đặt' });
      return;
    }
    setCreatingLocation(true);
    const body: CreateInspectionLocationReq = {
      locationName: locationName.trim(),
      locationType,
      description: locationDescription.trim() || undefined,
      status: 'ACTIVE'
    };
    const response = await electricalDeviceServices.createInspectionLocation(body);
    setCreatingLocation(false);
    if (!response?.data?.id) {
      showToast({
        type: TYPE_TOAST.ERROR,
        content: getElectricalDeviceError(response as ErrorBase, 'Tạo điểm lắp đặt thất bại')
      });
      return;
    }
    const location = response.data;
    setLocations((current) => [...current, location]);
    setValue('locationId', String(location.id), { shouldDirty: true, shouldValidate: true });
    setLocationName('');
    setLocationDescription('');
    setLocationModalOpen(false);
    showToast({ type: TYPE_TOAST.SUCCESS, content: 'Đã tạo điểm lắp đặt' });
  }, [locationDescription, locationName, locationType, setValue]);

  const submit = useCallback(
    async (data: DeviceForm) => {
      if (isAdd && needsVerification) {
        if (!data.verificationDate || !data.certificateNo || !data.resultStatus) {
          showToast({
            type: TYPE_TOAST.ERROR,
            content: 'Vui lòng nhập ngày kiểm định, số giấy chứng nhận và kết quả'
          });
          return;
        }
        const first = dayjs(data.verificationDate, API_DATE_INPUT_FORMATS, true);
        const due = dayjs(data.nextVerificationDate, API_DATE_INPUT_FORMATS, true);
        if (!first.isValid() || !due.isValid() || due.isBefore(first, 'day')) {
          showToast({ type: TYPE_TOAST.ERROR, content: 'Ngày hết hạn không hợp lệ' });
          return;
        }
      }
      setSaving(true);
      const common = {
        deviceCode: data.deviceCode || undefined,
        deviceName: data.deviceName || undefined,
        deviceType: data.deviceType,
        serialNumber: data.serialNumber || undefined,
        manufacturer: data.manufacturer || undefined,
        supplier: data.supplier || undefined,
        locationId: Number(data.locationId),
        status: data.status || undefined,
        notes: data.notes || undefined
      };
      const response = isAdd
        ? await electricalDeviceServices.createElectricalDevice({
            ...common,
            ...(needsVerification
              ? {
                  verificationDate: normalizeInspectionDate(data.verificationDate),
                  certificateNo: data.certificateNo || undefined,
                  resultStatus: data.resultStatus || undefined,
                  nextVerificationDate: normalizeInspectionDate(data.nextVerificationDate),
                  verificationNotes: data.verificationNotes || undefined,
                  file: selectedFile
                }
              : {})
          })
        : await electricalDeviceServices.updateElectricalDevice({ id, ...common });
      setSaving(false);
      if (!response?.data) {
        showToast({
          type: TYPE_TOAST.ERROR,
          content: getElectricalDeviceError(response as ErrorBase, 'Lưu thiết bị thất bại')
        });
        return;
      }
      showToast({
        type: TYPE_TOAST.SUCCESS,
        content: isAdd ? 'Tạo thiết bị thành công' : 'Cập nhật thiết bị thành công'
      });
      router.push(ROUTES.ELECTRICAL_DEVICE_VERIFICATION);
    },
    [id, isAdd, needsVerification, router, selectedFile]
  );

  const title = isAdd ? 'Thêm mới thiết bị' : 'Cập nhật thiết bị';

  return (
    <PageWithBreadcrumb
      breadcrumbList={[
        { title: 'Thiết bị' },
        {
          title: (
            <Link href={ROUTES.ELECTRICAL_DEVICE_VERIFICATION}>Theo dõi kiểm định thiết bị</Link>
          )
        },
        { title }
      ]}
    >
      <Spin spinning={loading}>
        <Flex justify="space-between" align="center" className="mb-16">
          <h1 className="title4">{title}</h1>
        </Flex>
        <form onSubmit={handleSubmit(submit)} className="grid gap-16">
          <section className="rounded-radius-l border border-color-300 bg-color-50 p-16">
            <h2 className="sub-title3 mb-16">1. Thông tin thiết bị</h2>
            <div className="grid grid-cols-3 gap-16 tablet:grid-cols-2 mobile:grid-cols-1">
              <div>
                <AppSelectControl
                  name="locationId"
                  label="Địa điểm lắp đặt"
                  labelSuffix={required}
                  placeholder="Chọn địa điểm"
                  options={locationOptions}
                  control={control}
                />
                <Button
                  type="link"
                  icon={<PlusOutlined />}
                  className="px-0"
                  onClick={() => setLocationModalOpen(true)}
                >
                  Thêm mới địa điểm
                </Button>
              </div>
              <AppSelectControl
                name="deviceType"
                label="Loại thiết bị"
                labelSuffix={required}
                placeholder="Chọn loại thiết bị"
                options={deviceTypes.map((item) => ({
                  value: item.id,
                  label: item.deviceName || item.id
                }))}
                control={control}
              />
              <AppTextFieldControl
                name="deviceCode"
                label="Mã thiết bị"
                placeholder="Nhập mã thiết bị"
                control={control}
              />
              <AppTextFieldControl
                name="serialNumber"
                label="Số serial"
                placeholder="Nhập số serial"
                control={control}
              />
              <AppTextFieldControl
                name="deviceName"
                label="Tên thiết bị"
                placeholder="Nhập tên thiết bị"
                control={control}
              />
              <AppTextFieldControl
                name="manufacturer"
                label="Hãng sản xuất"
                placeholder="Nhập hãng sản xuất"
                control={control}
              />
              <AppTextFieldControl
                name="supplier"
                label="Nhà cung cấp"
                placeholder="Nhập nhà cung cấp"
                control={control}
              />
              <AppTextFieldControl
                name="notes"
                label="Ghi chú"
                placeholder="Nhập ghi chú"
                control={control}
              />
            </div>
          </section>
          {isAdd && needsVerification && (
            <section className="rounded-radius-l border border-color-300 bg-color-50 p-16">
              <h2 className="sub-title3 mb-16">2. Thông tin kiểm định</h2>
              <div className="grid grid-cols-4 gap-16 tablet:grid-cols-2 mobile:grid-cols-1">
                <AppTextFieldControl
                  name="certificateNo"
                  label="Số giấy chứng nhận"
                  labelSuffix={required}
                  placeholder="Nhập số giấy chứng nhận"
                  control={control}
                />
                <AppDatePickerControl
                  name="verificationDate"
                  label="Ngày kiểm định"
                  labelSuffix={required}
                  backendFormat={FORMAT_DATE_API}
                  wrapperClassName="w-full"
                  datePickerClassName="w-full"
                  control={control}
                />
                <AppDatePickerControl
                  name="nextVerificationDate"
                  label="Ngày hết hạn"
                  labelSuffix={required}
                  backendFormat={FORMAT_DATE_API}
                  wrapperClassName="w-full"
                  datePickerClassName="w-full"
                  control={control}
                />
                <AppSelectControl
                  name="resultStatus"
                  label="Kết quả kiểm định"
                  labelSuffix={required}
                  placeholder="Chọn kết quả"
                  options={[
                    { value: 'PASS', label: 'Đạt' },
                    { value: 'FAIL', label: 'Không đạt' }
                  ]}
                  control={control}
                />
                <AppTextFieldControl
                  name="verificationNotes"
                  label="Ghi chú kiểm định"
                  placeholder="Nhập ghi chú"
                  control={control}
                />
                <div>
                  <label className="mb-4 block text-14 font-semibold">File kết quả</label>
                  <Input
                    type="file"
                    onChange={(event) => setSelectedFile(event.target.files?.[0])}
                  />
                </div>
                {selectedType?.inspectionCycleMonths ? (
                  <div className="self-end pb-8 text-13 text-color-700">
                    Chu kỳ kiểm định: {selectedType.inspectionCycleMonths} tháng
                  </div>
                ) : null}
              </div>
            </section>
          )}
          <Flex justify="end" gap={K_SIZE_8}>
            <ButtonBase
              type="ghost"
              customContent="Hủy"
              onClick={() => router.push(ROUTES.ELECTRICAL_DEVICE_VERIFICATION)}
            />
            <ButtonBase
              type="primary"
              customContent={saving ? 'Đang lưu...' : 'Lưu'}
              disabled={!formState.isValid || saving || (!isAdd && !formState.isDirty)}
              htmlType="submit"
            />
          </Flex>
        </form>
      </Spin>
      <Modal
        open={locationModalOpen}
        title="Thêm mới điểm lắp đặt"
        width={520}
        onCancel={() => setLocationModalOpen(false)}
        footer={
          <Flex justify="end" gap={K_SIZE_8}>
            <ButtonBase
              type="ghost"
              size={32}
              customContent="Hủy"
              onClick={() => setLocationModalOpen(false)}
              disabled={creatingLocation}
            />
            <ButtonBase
              type="primary"
              size={32}
              customContent={creatingLocation ? 'Đang lưu...' : 'Lưu'}
              onClick={() => void createLocation()}
              disabled={creatingLocation}
            />
          </Flex>
        }
      >
        <div className="grid gap-12">
          <AppTextField
            name="locationName"
            label="Tên"
            labelSuffix={required}
            size="large"
            value={locationName}
            placeholder="Nhập tên điểm lắp đặt"
            onChange={(event) => setLocationName(event.target.value)}
          />
          <AppSelect
            name="locationType"
            label="Loại"
            labelSuffix={required}
            value={locationType}
            options={LOCATION_TYPE_OPTIONS}
            overlayClassName="!z-[2005] [&_.ant-dropdown-menu-vertical]:max-h-full"
            onSelectOption={({ key }) => setLocationType(String(key))}
          />
          <label className="grid gap-4 text-14 font-semibold">
            Ghi chú
            <Input.TextArea
              rows={3}
              value={locationDescription}
              placeholder="Nhập ghi chú"
              onChange={(event) => setLocationDescription(event.target.value)}
            />
          </label>
        </div>
      </Modal>
    </PageWithBreadcrumb>
  );
}
