'use client';

import { DEFAULT_PAGE_SIZE, K_SIZE_1, K_SIZE_24, K_SIZE_8, NULL_VALUE } from '@constant';
import {
  CalendarOutlined,
  DownloadOutlined,
  EyeOutlined,
  PaperClipOutlined
} from '@ant-design/icons';
import { Drawer, Flex, Input, Divider, Spin } from 'antd';
import ButtonBase from 'components/button';
import { AppDatePicker } from 'components/date-picker';
import { AppSelect } from 'components/select';
import { AppTextField } from 'components/text-field';
import Status, { KIND_STATUS, TYPE_STATUS } from 'components/status';
import { TextBase } from 'components/text';
import AppTable from 'components/table';
import AppPagination from 'components/table/pagination';
import { TYPE_TOAST } from 'components/toast/type';
import { showToast } from 'components/toast';
import { ROUTES } from 'config/routes';
import PageWithBreadcrumb from 'layout/AppLayout/PageWithBreadcumb';
import { ElectricalDevice, InspectionLocation } from 'model/electrical-device';
import { ErrorBase } from 'model/common';
import { MeterVerification } from 'model/meter-verification';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import electricalDeviceServices from 'services/electrical-device-services';
import meterVerificationServices from 'services/meter-verification-services';
import { displayDateFromServer, FORMAT_DATE_API, FORMAT_DATE_PARAMS } from 'utils/date';
import {
  formatInspectionDate,
  getElectricalDeviceError,
  getVerificationStatusLabel,
  getVerificationStatusType
} from '../utils';
import { IconSvgLocal } from '../../../../components/icon-vec-local';
import { getResultStatusLabel } from '../../meter-verification/utils';

dayjs.extend(customParseFormat);

const Info = ({ label, value }: { label: string; value?: ReactNode }) => (
  <div className="grid grid-cols-[150px_1fr] gap-8 border-b border-color-200 py-8">
    <span className="text-color-600">{label}</span>
    <div className="font-medium">
      {value === undefined || value === null || value === '' ? NULL_VALUE : value}
    </div>
  </div>
);

export default function ElectricalDeviceDetailScreen() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get('id') || '';
  const [loading, setLoading] = useState(true);
  const [device, setDevice] = useState<ElectricalDevice>();
  const [location, setLocation] = useState<InspectionLocation>();
  const [verificationSummary, setVerificationSummary] = useState<ElectricalDevice>();
  const [history, setHistory] = useState<MeterVerification[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyPage, setHistoryPage] = useState(1);
  const [recordDrawerOpen, setRecordDrawerOpen] = useState(false);
  const [savingHistory, setSavingHistory] = useState(false);
  const [historyFile, setHistoryFile] = useState<File>();
  const [historyForm, setHistoryForm] = useState({
    verificationDate: dayjs().format(FORMAT_DATE_API),
    nextVerificationDate: '',
    certificateNo: '',
    resultStatus: 'PASS',
    notes: ''
  });
  const openHistoryFile = async (record: MeterVerification, action: 'view' | 'download') => {
    const response =
      action === 'view'
        ? await meterVerificationServices.viewMeterVerificationFile(record.id)
        : await meterVerificationServices.downloadMeterVerificationFile(record.id);
    if (!(response?.data instanceof Blob)) {
      showToast({
        type: TYPE_TOAST.ERROR,
        content: getElectricalDeviceError(response as ErrorBase, 'Không tải được hồ sơ kiểm định')
      });
      return;
    }
    const url = URL.createObjectURL(response.data);
    if (action === 'view') window.open(url, '_blank', 'noopener,noreferrer');
    else {
      const link = document.createElement('a');
      link.href = url;
      link.download = response.fileName || record.fileName || 'ho-so-kiem-dinh';
      link.click();
    }
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const saveVerification = async () => {
    if (!device?.id || !historyForm.verificationDate) return;
    setSavingHistory(true);
    const response = await meterVerificationServices.createMeterVerification({
      meterId: device.id,
      // deviceType: device.deviceType,
      verificationDate: historyForm.verificationDate,
      nextVerificationDate: historyForm.nextVerificationDate || undefined,
      certificateNo: historyForm.certificateNo.trim() || undefined,
      resultStatus: historyForm.resultStatus,
      notes: historyForm.notes.trim() || undefined,
      file: historyFile
    });
    setSavingHistory(false);
    if (!response?.data) {
      showToast({
        type: TYPE_TOAST.ERROR,
        content: getElectricalDeviceError(response as ErrorBase, 'Ghi nhận kiểm định thất bại')
      });
      return;
    }
    showToast({ type: TYPE_TOAST.SUCCESS, content: 'Ghi nhận kiểm định thành công' });
    setRecordDrawerOpen(false);
    setHistoryFile(undefined);
    setHistoryForm({
      verificationDate: dayjs().format(FORMAT_DATE_API),
      nextVerificationDate: '',
      certificateNo: '',
      resultStatus: 'PASS',
      notes: ''
    });
    setHistoryPage(1);
    const refreshed = await meterVerificationServices.searchMeterVerifications({
      meterId: device.id,
      // deviceType: device.deviceType,
      page: 0,
      size: DEFAULT_PAGE_SIZE
    });
    if (refreshed?.data) {
      setHistory(refreshed.data.items || []);
      setHistoryTotal(refreshed.data.total || 0);
    }
  };

  useEffect(() => {
    if (!id) {
      router.replace(ROUTES.ELECTRICAL_DEVICE_VERIFICATION);
      return;
    }
    let active = true;
    const load = async () => {
      setLoading(true);
      const response = await electricalDeviceServices.getElectricalDeviceDetail({ id });
      if (!active) return;
      if (!response?.data) {
        setLoading(false);
        showToast({
          type: TYPE_TOAST.ERROR,
          content: getElectricalDeviceError(response as ErrorBase, 'Tải chi tiết thiết bị thất bại')
        });
        router.replace(ROUTES.ELECTRICAL_DEVICE_VERIFICATION);
        return;
      }
      setDevice(response.data);
      if (response.data.locationId) {
        const locationResponse = await electricalDeviceServices.searchInspectionLocations({
          page: 0,
          size: 100,
          id: response.data.locationId
        });
        if (active) {
          const parent = locationResponse?.data?.items?.[0];
          setLocation(parent);
          setVerificationSummary(
            parent?.electricalDevices?.find((item) => item.id === response.data?.id)
          );
        }
      }
      if (active) setLoading(false);
    };
    void load();
    return () => {
      active = false;
    };
  }, [id, router]);

  useEffect(() => {
    if (!device?.id) {
      setHistory([]);
      setHistoryTotal(0);
      return;
    }

    let active = true;
    setHistoryLoading(true);
    void meterVerificationServices
      .searchMeterVerifications({
        meterId: device.id,
        // deviceType: device.deviceType,
        page: historyPage - K_SIZE_1,
        size: DEFAULT_PAGE_SIZE
      })
      .then((response) => {
        if (!active) return;
        if (!response?.data) {
          setHistory([]);
          setHistoryTotal(0);
          showToast({
            type: TYPE_TOAST.ERROR,
            content: getElectricalDeviceError(
              response as ErrorBase,
              'Tải lịch sử kiểm định thất bại'
            )
          });
          return;
        }
        setHistory(response.data.items || []);
        setHistoryTotal(response.data.total || 0);
      })
      .finally(() => {
        if (active) setHistoryLoading(false);
      });

    return () => {
      active = false;
    };
  }, [device?.id, historyPage]);

  const historyColumns: any[] = useMemo(
    () => [
      {
        title: 'STT',
        key: 'index',
        width: 70,
        align: 'center' as const,
        render: (_: unknown, __: MeterVerification, index: number) =>
          (historyPage - K_SIZE_1) * DEFAULT_PAGE_SIZE + index + K_SIZE_1
      },
      {
        title: 'Số giấy chứng nhận',
        dataIndex: 'certificateNo',
        key: 'certificateNo',
        render: (value?: string) =>
          value ? <span className="font-semibold text-secondary-600">{value}</span> : NULL_VALUE
      },
      {
        title: 'Ngày kiểm định',
        dataIndex: 'verificationDate',
        key: 'verificationDate',
        align: 'center' as const,
        render: (value?: string) => (value ? displayDateFromServer(value) : NULL_VALUE)
      },
      {
        title: 'Số chứng nhận',
        dataIndex: 'certificateNo',
        key: 'certificateNo',
        align: 'center' as const,
        render: (value?: string) => value || NULL_VALUE
      },
      {
        title: 'Kết quả',
        dataIndex: 'resultStatus',
        key: 'resultStatus',
        align: 'center' as const,
        render: (value?: string) => (
          <Status
            kind={KIND_STATUS.SECONDARY}
            type={value === 'FAILED' || value === 'FAIL' ? TYPE_STATUS.ERROR : TYPE_STATUS.SUCCESS}
            content={getResultStatusLabel(value)}
            wrapStyle="mx-auto"
          />
        )
      },
      {
        title: 'Ngày hết hạn',
        dataIndex: 'nextVerificationDate',
        key: 'nextVerificationDate',
        align: 'center' as const,
        render: (value?: string) => (value ? displayDateFromServer(value) : NULL_VALUE)
      },
      {
        title: 'Hồ sơ',
        key: 'files',
        align: 'center' as const,
        render: (_: unknown, record: MeterVerification) =>
          record.filePath ? (
            <Flex justify="center" align="center" gap={6}>
              <PaperClipOutlined />
              <span>{record.fileName || '1'}</span>
            </Flex>
          ) : (
            NULL_VALUE
          )
      },
      {
        title: 'Ghi chú',
        dataIndex: 'notes',
        key: 'notes',
        render: (value?: string) => value || NULL_VALUE
      },
      {
        title: 'Hành động',
        key: 'actions',
        align: 'center' as const,
        render: (_: unknown, record: MeterVerification) =>
          record.filePath ? (
            <Flex justify="center" gap={K_SIZE_8}>
              <EyeOutlined
                className="cursor-pointer"
                title="Xem hồ sơ"
                onClick={() => void openHistoryFile(record, 'view')}
              />
              <DownloadOutlined
                className="cursor-pointer"
                title="Tải hồ sơ"
                onClick={() => void openHistoryFile(record, 'download')}
              />
            </Flex>
          ) : (
            NULL_VALUE
          )
      }
    ],
    []
  );

  const breadcrumbs = [
    { title: 'Thiết bị' },
    {
      title: <Link href={ROUTES.ELECTRICAL_DEVICE_VERIFICATION}>Theo dõi kiểm định thiết bị</Link>
    },
    { title: 'Chi tiết thiết bị' }
  ];

  return (
    <PageWithBreadcrumb breadcrumbList={breadcrumbs}>
      <Spin spinning={loading}>
        <Flex
          justify="space-between"
          align="center"
          gap={K_SIZE_8}
          className="mb-16 mobile:flex-wrap"
        >
          <Flex align="center" gap={K_SIZE_8}>
            <IconSvgLocal
              classNames="cursor-pointer"
              name="ICON_ARROW_LINE_LEFT"
              height={K_SIZE_24}
              width={K_SIZE_24}
              onClick={() => router.push(ROUTES.ELECTRICAL_DEVICE_VERIFICATION)}
            />
            <TextBase classNames="title4" text="Chi tiết thiết bị" />
          </Flex>
          <ButtonBase
            type="primary"
            leftIcon="ICON_EDIT"
            customContent="Sửa"
            onClick={() => router.push(`${ROUTES.ELECTRICAL_DEVICE_VERIFICATION_EDIT}?id=${id}`)}
          />
        </Flex>
        <section className="rounded-radius-l border border-color-300 bg-color-50 p-16">
          <Flex
            justify="space-between"
            align="center"
            gap={K_SIZE_8}
            className="mobile:flex-col mobile:items-start"
          >
            <div>
              <TextBase
                classNames="title4"
                text={device?.deviceName || device?.deviceCode || 'Thiết bị'}
              />
              <div className="mt-8 flex flex-wrap gap-12 text-14 text-color-700">
                <span>
                  Mã thiết bị: <b>{device?.deviceCode || NULL_VALUE}</b>
                </span>
                <span>
                  Loại: <b>{device?.deviceTypeName || NULL_VALUE}</b>
                </span>
                <span>
                  Địa điểm: <b>{location?.locationName || NULL_VALUE}</b>
                </span>
              </div>
            </div>
            <div className="grid min-w-[240px] grid-cols-2 gap-12">
              <div>
                <div className="text-13 text-color-600">Ngày hết hạn</div>
                <b>{formatInspectionDate(verificationSummary?.nextVerificationDate)}</b>
              </div>
              <div>
                <div className="text-13 text-color-600">Trạng thái</div>
                <Status
                  kind={KIND_STATUS.SECONDARY}
                  type={getVerificationStatusType(verificationSummary?.verificationStatus)}
                  content={getVerificationStatusLabel(verificationSummary?.verificationStatus)}
                />
              </div>
            </div>
          </Flex>
        </section>

        <section className="mt-16 rounded-radius-l border border-color-300 bg-color-50 p-16">
          <TextBase classNames="sub-title3 mb-12" text="Thông tin thiết bị" />
          <div className="grid grid-cols-3 gap-x-24 tablet:grid-cols-2 mobile:grid-cols-1">
            <div>
              <Info label="Mã thiết bị" value={device?.deviceCode} />
              <Info label="Tên thiết bị" value={device?.deviceName} />
              <Info label="Loại thiết bị" value={device?.deviceTypeName} />
              <Info label="Số serial" value={device?.serialNumber} />
            </div>
            <div>
              <Info label="Địa điểm lắp đặt" value={location?.locationName} />
              <Info label="Hãng sản xuất" value={device?.manufacturer} />
              <Info label="Nhà cung cấp" value={device?.supplier} />
              <Info
                label="Trạng thái"
                value={
                  device?.status === 'ACTIVE' ? (
                    <Status
                      kind={KIND_STATUS.SECONDARY}
                      type={TYPE_STATUS.SUCCESS}
                      content="Hoạt động"
                    />
                  ) : device?.status === 'INACTIVE' ? (
                    <Status
                      kind={KIND_STATUS.SECONDARY}
                      type={TYPE_STATUS.DISABLED}
                      content="Không hoạt động"
                    />
                  ) : (
                    device?.status
                  )
                }
              />
            </div>
            <div>
              <Info
                label="Chu kỳ kiểm định"
                value={
                  device?.inspectionCycleMonths
                    ? `${device.inspectionCycleMonths} tháng`
                    : undefined
                }
              />
              <Info label="Ghi chú" value={device?.notes} />
            </div>
          </div>
        </section>

        <Divider />
        <section className="rounded-radius-l border border-color-300 bg-color-50 p-16">
          <Flex justify="space-between" align="center" className="mb-12">
            <div className={'flex gap-8'}>
              <CalendarOutlined />
              <TextBase classNames="sub-title4" text="Lịch sử kiểm định" />
            </div>

            <ButtonBase
              type="primary"
              leftIcon="IC_ADD_OUTLINE2"
              customContent="Ghi nhận kiểm định"
              onClick={() => setRecordDrawerOpen(true)}
            />
          </Flex>
          <Spin spinning={historyLoading}>
            <AppTable
              rowKey="id"
              dataSource={history}
              columns={historyColumns}
              scroll={{ x: 1000 }}
              pagination={false}
              locale={{ emptyText: 'Không có dữ liệu kiểm định' }}
            />
          </Spin>
          {historyTotal > DEFAULT_PAGE_SIZE && (
            <AppPagination
              currentPage={historyPage}
              total={historyTotal}
              pagination={{
                current: historyPage,
                pageSize: DEFAULT_PAGE_SIZE,
                showSizeChanger: false,
                onChange: setHistoryPage
              }}
            />
          )}
        </section>
        <Drawer
          title="Ghi nhận kiểm định"
          open={recordDrawerOpen}
          onClose={() => setRecordDrawerOpen(false)}
          placement="right"
          width="min(820px, 90vw)"
          footer={
            <Flex justify="end" gap={K_SIZE_8}>
              <ButtonBase
                type="ghost"
                customContent="Đóng"
                onClick={() => setRecordDrawerOpen(false)}
              />
              <ButtonBase
                type="primary"
                disabled={!historyForm.verificationDate || savingHistory}
                customContent={savingHistory ? 'Đang lưu...' : 'Xác nhận'}
                onClick={() => void saveVerification()}
              />
            </Flex>
          }
        >
          <div className="grid grid-cols-2 gap-12 mobile:grid-cols-1">
            <div className="col-span-2 mobile:col-span-1">
              <label className="mb-4 block text-14 font-semibold">Tên thiết bị</label>
              <AppTextField
                size="large"
                value={device?.deviceName || device?.deviceCode || ''}
                disabled
              />
            </div>
            <div>
              <AppDatePicker
                wrapperClassName="w-full"
                datePickerClassName="w-full"
                name="verificationDate"
                label="Ngày kiểm định đầu tiên/gần nhất"
                labelSuffix={<span className="text-error-600">*</span>}
                format={FORMAT_DATE_PARAMS}
                value={
                  historyForm.verificationDate
                    ? dayjs(historyForm.verificationDate, FORMAT_DATE_API)
                    : null
                }
                onChange={(date) =>
                  setHistoryForm((current) => ({
                    ...current,
                    verificationDate: date ? date.format(FORMAT_DATE_API) : ''
                  }))
                }
              />
            </div>
            <div>
              <AppDatePicker
                wrapperClassName="w-full"
                datePickerClassName="w-full"
                name="nextVerificationDate"
                label="Thời hạn kiểm định"
                format={FORMAT_DATE_PARAMS}
                value={
                  historyForm.nextVerificationDate
                    ? dayjs(historyForm.nextVerificationDate, FORMAT_DATE_API)
                    : null
                }
                onChange={(date) =>
                  setHistoryForm((current) => ({
                    ...current,
                    nextVerificationDate: date ? date.format(FORMAT_DATE_API) : ''
                  }))
                }
              />
            </div>
            <div>
              <AppTextField
                size="large"
                label="Số chứng nhận"
                value={historyForm.certificateNo}
                placeholder="Nhập số chứng nhận"
                onChange={(event) =>
                  setHistoryForm((current) => ({ ...current, certificateNo: event.target.value }))
                }
              />
            </div>
            <div>
              <AppSelect
                name="resultStatus"
                label="Kết quả"
                labelSuffix={<span className="text-error-600">*</span>}
                value={historyForm.resultStatus}
                options={[
                  { value: 'PASS', label: 'Đạt' },
                  { value: 'FAIL', label: 'Không đạt' }
                ]}
                onSelectOption={({ key }) =>
                  setHistoryForm((current) => ({ ...current, resultStatus: String(key) }))
                }
              />
            </div>
            <div className="col-span-2 mobile:col-span-1">
              <AppTextField
                size="large"
                label="Ghi chú"
                value={historyForm.notes}
                placeholder="Nhập ghi chú"
                onChange={(event) =>
                  setHistoryForm((current) => ({ ...current, notes: event.target.value }))
                }
              />
            </div>
            <div className="col-span-2 mobile:col-span-1">
              <label className="mb-4 block text-14 font-semibold">File kết quả kiểm định</label>
              <Input type="file" onChange={(event) => setHistoryFile(event.target.files?.[0])} />
            </div>
          </div>
        </Drawer>
      </Spin>
    </PageWithBreadcrumb>
  );
}
