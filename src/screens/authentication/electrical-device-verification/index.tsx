'use client';

import { EditOutlined, EyeOutlined } from '@ant-design/icons';
import { DEFAULT_PAGE_SIZE, K_SIZE_1, K_SIZE_8, NULL_VALUE } from '@constant';
import { Divider, Flex, Input, Spin } from 'antd';
import ButtonBase from 'components/button';
import { AppDatePicker } from 'components/date-picker';
import { IconSvgLocal } from 'components/icon-vec-local';
import { AppSelect } from 'components/select';
import Status, { KIND_STATUS } from 'components/status';
import AppTable from 'components/table';
import AppPagination from 'components/table/pagination';
import { TextBase } from 'components/text';
import { ROUTES } from 'config/routes';
import PageWithBreadcrumb from 'layout/AppLayout/PageWithBreadcumb';
import { InspectionLocation } from 'model/electrical-device';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, type Key } from 'react';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { API_DATE_INPUT_FORMATS, FORMAT_DATE_API, FORMAT_DATE_PARAMS } from 'utils/date';
import useElectricalDeviceVerification from './useElectricalDeviceVerification';
import {
  formatInspectionDate,
  getVerificationStatusLabel,
  getVerificationStatusType,
  VERIFICATION_STATUS_OPTIONS
} from './utils';

dayjs.extend(customParseFormat);

const breadcrumbs = [
  { title: 'Thiết bị' },
  { title: 'Theo dõi kiểm định thiết bị', key: ROUTES.ELECTRICAL_DEVICE_VERIFICATION }
];

export default function ElectricalDeviceVerificationScreen() {
  const router = useRouter();
  const {
    draft,
    locations,
    deviceTypes,
    deviceTypeLabels,
    total,
    page,
    loading,
    pagination,
    updateFilter,
    applyFilter,
    resetFilter
  } = useElectricalDeviceVerification();
  const [expandedRowKeys, setExpandedRowKeys] = useState<Key[]>([]);

  useEffect(() => {
    const firstLocationWithDevices = locations.find(
      (location) => location.electricalDevices?.length
    );
    setExpandedRowKeys(firstLocationWithDevices ? [`location-${firstLocationWithDevices.id}`] : []);
  }, [locations]);

  const dataSource = useMemo(
    () =>
      locations.map((location) => ({
        ...location,
        key: `location-${location.id}`,
        rowKind: 'location',
        children: location.electricalDevices?.length
          ? location.electricalDevices.map((device) => ({
              ...device,
              key: `device-${device.id}`,
              rowKind: 'device'
            }))
          : [{ key: `empty-${location.id}`, rowKind: 'empty' }]
      })),
    [locations]
  );

  const childColumns = useMemo<any[]>(() => {
    const baseColumns = [
      {
        title: 'STT',
        key: 'index',
        width: 70,
        align: 'center',
        render: (_: unknown, record: any, index: number) => index + K_SIZE_1
      },
      {
        title: 'Mã thiết bị',
        dataIndex: 'deviceCode',
        align: 'center',
        width: 150,
        render: (value: string, record: any) =>
          record.rowKind === 'device' ? (
            <button
              type="button"
              className="font-semibold text-secondary-600 hover:underline"
              onClick={() =>
                router.push(`${ROUTES.ELECTRICAL_DEVICE_VERIFICATION_DETAIL}?id=${record.id}`)
              }
            >
              {value || NULL_VALUE}
            </button>
          ) : null
      },
      {
        title: 'Tên thiết bị',
        dataIndex: 'deviceName',
        align: 'center',
        width: 200,
        render: (value: string, record: any) =>
          record.rowKind === 'device' ? value || NULL_VALUE : null
      },
      {
        title: 'Loại thiết bị',
        dataIndex: 'deviceType',
        align: 'center',
        width: 170,
        render: (value: string, record: any) =>
          record.rowKind === 'device' ? deviceTypeLabels[value] || value || NULL_VALUE : null
      },
      {
        title: 'Giấy chứng nhận',
        key: 'certificateNo',
        dataIndex: 'certificateNo',
        align: 'center',
        width: 180,
        render: (_: unknown, record: any) =>
          record.rowKind === 'device' ? record.certificateNo : null
      },
      {
        title: 'Ngày kiểm định',
        key: 'verificationDate',
        dataIndex: 'verificationDate',
        align: 'center',
        width: 150,
        render: (value: string, record: any) =>
          record.rowKind === 'device' ? formatInspectionDate(value) : null
      },
      {
        title: 'Hết kiểm định',
        dataIndex: 'nextVerificationDate',
        align: 'center',
        width: 150,
        render: (value: string, record: any) =>
          record.rowKind === 'device' ? formatInspectionDate(value) : null
      },
      {
        title: 'Trạng thái',
        dataIndex: 'verificationStatus',
        align: 'center',
        width: 150,
        render: (value: string, record: any) =>
          record.rowKind === 'device' ? (
            <Status
              kind={KIND_STATUS.SECONDARY}
              type={getVerificationStatusType(value)}
              content={getVerificationStatusLabel(value)}
              wrapStyle="mx-auto"
            />
          ) : null
      },
      {
        title: 'Hành động',
        key: 'actions',
        width: 110,
        align: 'center',
        render: (_: unknown, record: any) =>
          record.rowKind === 'device' ? (
            <Flex justify="center" gap={K_SIZE_8}>
              <EyeOutlined
                className="cursor-pointer text-color-800"
                title="Xem chi tiết"
                onClick={() =>
                  router.push(`${ROUTES.ELECTRICAL_DEVICE_VERIFICATION_DETAIL}?id=${record.id}`)
                }
              />
              <EditOutlined
                className="cursor-pointer text-color-800"
                title="Sửa thiết bị"
                onClick={() =>
                  router.push(`${ROUTES.ELECTRICAL_DEVICE_VERIFICATION_EDIT}?id=${record.id}`)
                }
              />
            </Flex>
          ) : null
      }
    ];
    return baseColumns;
  }, [deviceTypeLabels, router]);

  const rootColumns = useMemo(
    () =>
      childColumns.map((column, index) => ({
        ...column,
        render: (value: unknown, record: any, rowIndex: number) =>
          record.rowKind === 'location'
            ? index === 0 && (
                <Flex align="center" gap={K_SIZE_8}>
                  <button
                    type="button"
                    className="flex shrink-0 items-center"
                    aria-label={
                      expandedRowKeys.includes(record.key) ? 'Thu gọn nhóm' : 'Mở rộng nhóm'
                    }
                    onClick={() =>
                      setExpandedRowKeys((current) =>
                        current.includes(record.key)
                          ? current.filter((key) => key !== record.key)
                          : [...current, record.key]
                      )
                    }
                  >
                    <IconSvgLocal
                      height={20}
                      width={20}
                      name="ICON_ARROW_LEFT"
                      classNames={
                        expandedRowKeys.includes(record.key) ? '-rotate-90' : 'rotate-180'
                      }
                    />
                  </button>
                  <TextBase
                    classNames="sub-title4 !text-color-900"
                    text={record.locationName || `Điểm ${record.id}`}
                  />
                </Flex>
              )
            : record.rowKind === 'empty'
              ? index === 0 && (
                  <span className="text-color-700">Không có dữ liệu kiểm định thiết bị</span>
                )
              : column.render?.(value, record, rowIndex),
        onCell: (record: any) =>
          record.rowKind === 'location'
            ? {
                colSpan: index === 0 ? childColumns.length : 0,
                ...(index === 0 ? { style: { textAlign: 'left' } } : {})
              }
            : record.rowKind === 'empty'
              ? {
                  colSpan: index === 0 ? childColumns.length : 0,
                  ...(index === 0 ? { style: { textAlign: 'center' } } : {})
                }
              : { style: { textAlign: 'center', verticalAlign: 'middle' } }
      })),
    [childColumns, expandedRowKeys]
  );

  const datePicker = (
    key:
      | 'verificationDateFrom'
      | 'verificationDateTo'
      | 'nextVerificationDateFrom'
      | 'nextVerificationDateTo',
    label: string
  ) => (
    <AppDatePicker
      name={key}
      label={label}
      wrapperClassName="w-full"
      value={draft[key] ? dayjs(draft[key], API_DATE_INPUT_FORMATS) : undefined}
      format={FORMAT_DATE_PARAMS}
      onChange={(date) => updateFilter(key, date ? date.format(FORMAT_DATE_API) : '')}
    />
  );

  return (
    <PageWithBreadcrumb breadcrumbList={breadcrumbs}>
      <section>
        <Flex
          justify="space-between"
          align="center"
          gap={K_SIZE_8}
          className="mobile:flex-col mobile:items-start"
        >
          <TextBase classNames="title4" text="Quản lý kiểm định thiết bị theo điểm lắp đặt" />
          <ButtonBase
            type="primary"
            leftIcon="IC_ADD_OUTLINE2"
            customContent="Thêm mới"
            onClick={() => router.push(ROUTES.ELECTRICAL_DEVICE_VERIFICATION_ADD)}
          />
        </Flex>
        <Divider className="my-16" />
        <div className="mb-16 rounded-radius-l border border-color-300 bg-color-50 p-16">
          <div className="grid grid-cols-4 items-end gap-12 desktop:grid-cols-4 tablet:grid-cols-2 mobile:grid-cols-1">
            <div>
              <label className="mb-4 block text-14 font-semibold">Mã điểm lắp đặt (ID)</label>
              <Input
                size="large"
                type="number"
                min={1}
                value={draft.locationId}
                placeholder="Nhập ID điểm lắp đặt"
                onChange={(event) => updateFilter('locationId', event.target.value)}
              />
            </div>
            <div>
              <label className="mb-4 block text-14 font-semibold">Tên điểm lắp đặt</label>
              <Input
                size="large"
                value={draft.locationName}
                placeholder="Nhập tên điểm lắp đặt"
                onChange={(event) => updateFilter('locationName', event.target.value)}
              />
            </div>
            <AppSelect
              name="deviceType"
              label="Loại thiết bị"
              placeholder="Tất cả"
              value={draft.deviceType}
              options={deviceTypes.map((item) => ({
                value: item.id,
                label: item.deviceName || item.id
              }))}
              onSelectOption={({ key }) => updateFilter('deviceType', String(key))}
            />
            <AppSelect
              name="verificationStatus"
              label="Trạng thái kiểm định"
              placeholder="Tất cả"
              value={draft.verificationStatus}
              options={VERIFICATION_STATUS_OPTIONS}
              onSelectOption={({ key }) => updateFilter('verificationStatus', String(key))}
            />
            <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-8">
              <div>{datePicker('verificationDateFrom', 'Ngày kiểm định từ')}</div>
              <span className="pb-12">đến</span>
              <div>{datePicker('verificationDateTo', ' ')}</div>
            </div>
            <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-8">
              <div>{datePicker('nextVerificationDateFrom', 'Ngày hết hạn từ')}</div>
              <span className="pb-12">đến</span>
              <div>{datePicker('nextVerificationDateTo', ' ')}</div>
            </div>
            <Flex justify="end" gap={K_SIZE_8} className="col-span-2 mobile:col-span-1">
              <ButtonBase type="ghost" customContent="Xóa bộ lọc" onClick={resetFilter} />
              <ButtonBase
                type="primary"
                leftIcon="IC_SEARCH_OUTLINE2"
                customContent="Tìm kiếm"
                onClick={applyFilter}
              />
            </Flex>
          </div>
        </div>
        <Spin spinning={loading}>
          <div className="overflow-hidden rounded-radius-l border border-color-300 bg-color-50">
            <Flex
              justify="space-between"
              align="center"
              className="border-b border-color-300 px-16 py-12"
            >
              <TextBase classNames="sub-title4" text="Danh sách nhóm theo điểm lắp đặt" />
              <span className="text-14 text-color-700">Hiển thị {total} điểm</span>
            </Flex>
            <AppTable
              rootClassName="w-full"
              dataSource={
                dataSource as (InspectionLocation & {
                  rowKind: string;
                })[]
              }
              tableLayout="fixed"
              columns={rootColumns}
              rowKey="key"
              expandable={{
                expandedRowKeys,
                rowExpandable: (record) => record.rowKind === 'location',
                showExpandColumn: false,
                indentSize: 0,
                onExpand: (expanded, record) =>
                  setExpandedRowKeys((current) =>
                    expanded
                      ? [...current, record.key]
                      : current.filter((key) => key !== record.key)
                  )
              }}
              rowClassName={(record: any) =>
                record.rowKind === 'location' ? 'bg-color-100 font-semibold' : ''
              }
              pagination={false}
              locale={{ emptyText: 'Không có dữ liệu kiểm định thiết bị' }}
            />
          </div>
          {total > DEFAULT_PAGE_SIZE && (
            <AppPagination currentPage={page} total={total} pagination={pagination} />
          )}
        </Spin>
      </section>
    </PageWithBreadcrumb>
  );
}
