'use client';

import { EditOutlined, SearchOutlined } from '@ant-design/icons';
import { K_SIZE_1, K_SIZE_8, K_SIZE_10, NULL_VALUE, K_SIZE_80 } from '@constant';
import { Drawer, Flex, Radio, Spin } from 'antd';
import ButtonBase from 'components/button';
import { AppSelect } from 'components/select';
import Status, { KIND_STATUS, TYPE_STATUS } from 'components/status';
import AppTable from 'components/table';
import AppPagination from 'components/table/pagination';
import { AppTextField } from 'components/text-field';
import { TextBase } from 'components/text';
import { TYPE_TOAST } from 'components/toast/type';
import { showToast } from 'components/toast';
import { ROUTES } from 'config/routes';
import PageWithBreadcrumb from 'layout/AppLayout/PageWithBreadcumb';
import { ErrorBase } from 'model/common';
import {
  CreateMasterDeviceReq,
  MasterDevice,
  UpdateMasterDeviceReq
} from 'model/electrical-device';
import { useCallback, useEffect, useMemo, useState } from 'react';
import electricalDeviceServices from 'services/electrical-device-services';
import { hasVerificationRequirement } from '../electrical-device-verification/utils';

type DeviceStatusFilter = '' | 'ACTIVE' | 'INACTIVE';
const DEVICE_PAGE_SIZE = K_SIZE_10;

interface DeviceFormState {
  deviceName: string;
  hasverification: '1' | '0';
  inspectionCycleMonths: string;
  status: 'ACTIVE' | 'INACTIVE';
}

const emptyForm: DeviceFormState = {
  deviceName: '',
  hasverification: '1',
  inspectionCycleMonths: '12',
  status: 'ACTIVE'
};

const breadcrumbs = [
  { title: 'Thiết bị' },
  { title: 'Quản lý thiết bị', key: ROUTES.MASTER_DEVICE_CATALOG }
];

const getMasterDeviceError = (response: ErrorBase | undefined, fallback: string) =>
  response?.businessErrorMessage || response?.systemErrorMessage || response?.message || fallback;

const isMasterDeviceActive = (status?: string) => status?.toUpperCase() === 'ACTIVE';

export default function MasterDeviceCatalogScreen() {
  const [devices, setDevices] = useState<MasterDevice[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchDraft, setSearchDraft] = useState('');
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<DeviceStatusFilter>('');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<MasterDevice>();
  const [form, setForm] = useState<DeviceFormState>(emptyForm);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearchText(searchDraft.trim());
      setPage(K_SIZE_1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchDraft]);

  const fetchDevices = useCallback(async () => {
    setLoading(true);
    const query = searchText;
    const isIdQuery = /^[0-9a-f-]{16,}$/i.test(query);
    const response = await electricalDeviceServices.searchMasterDevices({
      page: page - K_SIZE_1,
      size: DEVICE_PAGE_SIZE,
      ...(query ? (isIdQuery ? { id: query } : { deviceName: query }) : {}),
      ...(statusFilter ? { status: statusFilter } : {})
    });
    setLoading(false);
    if (!response?.data) {
      setDevices([]);
      setTotal(0);
      showToast({
        type: TYPE_TOAST.ERROR,
        content: getMasterDeviceError(response as ErrorBase, 'Tải danh mục thiết bị thất bại')
      });
      return;
    }
    setDevices(response.data.items || []);
    setTotal(response.data.total || 0);
  }, [page, searchText, statusFilter]);

  useEffect(() => {
    void fetchDevices();
  }, [fetchDevices]);

  const openCreate = () => {
    setIsEditing(false);
    setSelectedDevice(undefined);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = useCallback(async (device: MasterDevice) => {
    setIsEditing(true);
    setSelectedDevice(device);
    setForm({
      deviceName: device.deviceName || '',
      hasverification: hasVerificationRequirement(device.hasverification ?? device.hasVerification)
        ? '1'
        : '0',
      inspectionCycleMonths: String(device.inspectionCycleMonths || 0),
      status: isMasterDeviceActive(device.status) ? 'ACTIVE' : 'INACTIVE'
    });
    setModalOpen(true);
    const response = await electricalDeviceServices.getMasterDeviceDetail({ id: device.id });
    if (response?.data?.id) {
      const detail = response.data;
      setSelectedDevice(detail);
      setForm({
        deviceName: detail.deviceName || '',
        hasverification: hasVerificationRequirement(
          detail.hasverification ?? detail.hasVerification
        )
          ? '1'
          : '0',
        inspectionCycleMonths: String(detail.inspectionCycleMonths || 0),
        status: isMasterDeviceActive(detail.status) ? 'ACTIVE' : 'INACTIVE'
      });
    }
  }, []);

  const updateForm = <K extends keyof DeviceFormState>(key: K, value: DeviceFormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const saveDevice = async () => {
    if (!form.deviceName.trim()) {
      showToast({ type: TYPE_TOAST.ERROR, content: 'Vui lòng nhập tên thiết bị' });
      return;
    }
    const needsVerification = form.hasverification === '1';
    const cycle = Number(form.inspectionCycleMonths);
    if (needsVerification && (!Number.isInteger(cycle) || cycle <= 0)) {
      showToast({
        type: TYPE_TOAST.ERROR,
        content: 'Chu kỳ kiểm định phải là số tháng lớn hơn 0'
      });
      return;
    }

    setSaving(true);
    const fields = {
      deviceName: form.deviceName.trim(),
      hasverification: form.hasverification,
      inspectionCycleMonths: needsVerification ? cycle : 0,
      status: form.status
    };
    const response =
      isEditing && selectedDevice
        ? await electricalDeviceServices.updateMasterDevice({
            ...fields,
            id: selectedDevice.id
          } as UpdateMasterDeviceReq)
        : await electricalDeviceServices.createMasterDevice(fields as CreateMasterDeviceReq);
    setSaving(false);
    if (!response?.data) {
      showToast({
        type: TYPE_TOAST.ERROR,
        content: getMasterDeviceError(
          response as ErrorBase,
          isEditing ? 'Cập nhật thiết bị thất bại' : 'Thêm thiết bị thất bại'
        )
      });
      return;
    }
    showToast({
      type: TYPE_TOAST.SUCCESS,
      content: isEditing ? 'Đã cập nhật thiết bị' : 'Đã thêm thiết bị'
    });
    setModalOpen(false);
    if (page !== K_SIZE_1) setPage(K_SIZE_1);
    else void fetchDevices();
  };

  const columns = useMemo<any[]>(
    () => [
      {
        title: 'STT',
        key: 'index',
        width: K_SIZE_80,
        align: 'center',
        render: (_: unknown, __: any, index: number) => index + K_SIZE_1
      },
      {
        title: 'Tên thiết bị',
        dataIndex: 'deviceName',
        key: 'deviceName',
        render: (value?: string) => value || NULL_VALUE
      },
      {
        title: 'Kiểm định',
        dataIndex: 'hasverification',
        key: 'hasverification',
        align: 'center' as const,
        width: 140,
        render: (value: boolean | string) => (hasVerificationRequirement(value) ? 'Có' : 'Không')
      },
      {
        title: 'Chu kỳ',
        dataIndex: 'inspectionCycleMonths',
        key: 'inspectionCycleMonths',
        align: 'center' as const,
        width: 150,
        render: (value?: number) => (value ? `${value} tháng` : '—')
      },
      {
        title: 'Trạng thái',
        dataIndex: 'status',
        key: 'status',
        align: 'center' as const,
        width: 170,
        render: (value?: string) => (
          <Status
            kind={KIND_STATUS.SECONDARY}
            type={isMasterDeviceActive(value) ? TYPE_STATUS.SUCCESS : TYPE_STATUS.DISABLED}
            content={isMasterDeviceActive(value) ? 'Hoạt động' : 'Ngừng'}
            wrapStyle="mx-auto"
          />
        )
      },
      {
        title: 'Thao tác',
        key: 'actions',
        align: 'center' as const,
        width: 110,
        render: (_: unknown, record: MasterDevice) => (
          <button
            type="button"
            className="text-color-800 hover:text-primary-600"
            title="Sửa thiết bị"
            onClick={() => void openEdit(record)}
          >
            <EditOutlined />
          </button>
        )
      }
    ],
    [openEdit]
  );
  return (
    <PageWithBreadcrumb breadcrumbList={breadcrumbs}>
      <section>
        <Flex justify="space-between" align="center" gap={K_SIZE_8} className="mb-16">
          <div>
            <TextBase classNames="title4" text="Danh mục thiết bị" />
            <TextBase
              classNames="mt-4 text-14 text-color-700"
              text="Quản lý loại thiết bị và chu kỳ kiểm định"
            />
          </div>
          <ButtonBase
            type="primary"
            leftIcon="IC_ADD_OUTLINE2"
            customContent="Thêm mới"
            onClick={openCreate}
          />
        </Flex>

        <div className="overflow-hidden rounded-radius-l border border-color-300 bg-color-50">
          <Flex
            align="center"
            gap={K_SIZE_8}
            className="border-b border-color-300 p-16 mobile:flex-col"
          >
            <AppTextField
              name="deviceSearch"
              value={searchDraft}
              placeholder="Tìm mã hoặc tên thiết bị..."
              prefix={<SearchOutlined className="text-color-600" />}
              onChange={(event) => setSearchDraft(event.target.value)}
              wrapperClassName="flex-1"
            />
            <AppSelect
              name="deviceStatus"
              value={statusFilter}
              options={[
                { value: '', label: 'Tất cả trạng thái' },
                { value: 'ACTIVE', label: 'Hoạt động' },
                { value: 'INACTIVE', label: 'Ngừng' }
              ]}
              onSelectOption={({ key }) => {
                setStatusFilter(String(key) as DeviceStatusFilter);
                setPage(K_SIZE_1);
              }}
              wrapperClassName="w-[220px] mobile:w-full"
            />
          </Flex>

          <Spin spinning={loading}>
            <AppTable
              rootClassName="w-full"
              dataSource={devices}
              columns={columns}
              rowKey="id"
              pagination={false}
              locale={{ emptyText: 'Không có dữ liệu thiết bị' }}
              scroll={{ x: 850 }}
            />
          </Spin>
        </div>
        {total > 0 && (
          <AppPagination
            currentPage={page}
            total={total}
            pagination={{
              current: page,
              pageSize: DEVICE_PAGE_SIZE,
              showSizeChanger: false,
              hideOnSinglePage: false,
              onChange: setPage
            }}
          />
        )}
      </section>

      <Drawer
        open={modalOpen}
        title={isEditing ? 'Cập nhật thiết bị' : 'Thêm mới thiết bị'}
        placement="right"
        width={560}
        destroyOnClose
        onClose={() => setModalOpen(false)}
        footer={
          <Flex justify="end" gap={K_SIZE_8}>
            <ButtonBase
              type="ghost"
              customContent="Hủy"
              onClick={() => setModalOpen(false)}
              disabled={saving}
            />
            <ButtonBase
              type="primary"
              customContent={saving ? 'Đang lưu...' : 'Lưu thiết bị'}
              onClick={() => void saveDevice()}
              disabled={saving}
            />
          </Flex>
        }
      >
        <div className="grid gap-16 pt-8">
          <AppTextField
            name="deviceName"
            label="Tên thiết bị"
            labelSuffix={<span className="text-error-600">*</span>}
            value={form.deviceName}
            placeholder="Nhập tên thiết bị"
            onChange={(event) => updateForm('deviceName', event.target.value)}
          />

          <div>
            <div className="mb-8 text-14 font-semibold text-color-900">
              Yêu cầu kiểm định <span className="text-error-600">*</span>
            </div>
            <Radio.Group
              value={form.hasverification}
              onChange={(event) => updateForm('hasverification', event.target.value)}
            >
              <Radio value="1">Có kiểm định</Radio>
              <Radio value="0">Không kiểm định</Radio>
            </Radio.Group>
          </div>

          {form.hasverification === '1' && (
            <AppTextField
              name="inspectionCycleMonths"
              type="number"
              label="Chu kỳ kiểm định (tháng)"
              labelSuffix={<span className="text-error-600">*</span>}
              value={form.inspectionCycleMonths}
              placeholder="Nhập chu kỳ kiểm định"
              caption="Ví dụ: 12 tháng, 24 tháng, 36 tháng"
              onChange={(event) => updateForm('inspectionCycleMonths', event.target.value)}
            />
          )}

          <div>
            <div className="mb-8 text-14 font-semibold text-color-900">Trạng thái</div>
            <Radio.Group
              value={form.status}
              onChange={(event) => updateForm('status', event.target.value)}
            >
              <Radio value="ACTIVE">Hoạt động</Radio>
              <Radio value="INACTIVE">Ngừng hoạt động</Radio>
            </Radio.Group>
          </div>
        </div>
      </Drawer>
    </PageWithBreadcrumb>
  );
}
