'use client';

import {
  DEFAULT_PAGE_SIZE,
  K_SIZE_0,
  K_SIZE_1,
  K_SIZE_120,
  K_SIZE_140,
  K_SIZE_150,
  K_SIZE_18,
  K_SIZE_8,
  NULL_VALUE
} from '@constant';
import { Divider, Flex } from 'antd';
import ButtonBase from 'components/button';
import IconHover from 'components/icon-vec-local/icon-hover';
import { AppSelect } from 'components/select';
import Status, { KIND_STATUS } from 'components/status';
import AppTable from 'components/table';
import AppPagination from 'components/table/pagination';
import TagFilter from 'components/tag-filter';
import { TextBase } from 'components/text';
import { AppTextField } from 'components/text-field';
import { ROUTES } from 'config/routes';
import PageWithBreadcrumb from 'layout/AppLayout/PageWithBreadcumb';
import { ErrorBase } from 'model/common';
import { MeasuringDevice } from 'model/measuring-device';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  DELETE_MEASURING_DEVICE,
  SEARCH_MEASURING_DEVICE
} from '@redux-action-type/measuring-device';
import { dispatch } from '@redux-common';
import {
  selectMeasuringDeviceItems,
  selectMeasuringDeviceLoadingList,
  selectMeasuringDeviceTotal
} from '@redux-selector/measuring-device';
import { showDialog } from 'components/dialog';
import { TYPE_ACTION, TYPE_MESSAGE } from 'components/dialog/type';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import { MeasuringDeviceFilter } from './hooks/useMeasuringDeviceForm';
import {
  buildSearchBody,
  defaultDeviceFilter,
  DEVICE_STATUS_OPTIONS,
  DEVICE_TYPE_OPTIONS,
  getDeviceError,
  getDeviceStatusLabel,
  getDeviceStatusType,
  getDeviceTypeLabel,
  renderDeviceDate
} from './utils';

const filterLabels: Record<keyof MeasuringDeviceFilter, string> = {
  deviceCode: 'Mã TU/TI',
  serialNumber: 'Số sê-ri',
  deviceType: 'Loại',
  status: 'Trạng thái'
};
const text = (value?: string | number) =>
  value === undefined || value === null || value === '' ? NULL_VALUE : String(value);

export default function MeasuringDeviceScreen() {
  const router = useRouter();
  const items = useSelector(selectMeasuringDeviceItems);
  const total = useSelector(selectMeasuringDeviceTotal);
  const loading = useSelector(selectMeasuringDeviceLoadingList);
  const [page, setPage] = useState(K_SIZE_1);
  const [draft, setDraft] = useState(defaultDeviceFilter);
  const [applied, setApplied] = useState(defaultDeviceFilter);
  const fetchList = useCallback(
    (nextPage: number) =>
      dispatch({
        type: SEARCH_MEASURING_DEVICE,
        payload: {
          body: buildSearchBody(applied, nextPage),
          onFailed: (error?: ErrorBase) =>
            showToast({
              type: TYPE_TOAST.ERROR,
              content: getDeviceError(error, 'Tải danh sách TU/TI thất bại')
            })
        }
      }),
    [applied]
  );
  useEffect(() => {
    fetchList(page);
  }, [fetchList, page]);
  const pagination = useMemo(
    () => ({
      current: page,
      total,
      pageSize: DEFAULT_PAGE_SIZE,
      onChange: (value: number) => setPage(value),
      showSizeChanger: false
    }),
    [page, total]
  );
  const update = <K extends keyof MeasuringDeviceFilter>(key: K, value: MeasuringDeviceFilter[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));
  const apply = () => {
    setApplied(draft);
    setPage(K_SIZE_1);
  };
  const reset = (key?: keyof MeasuringDeviceFilter) => {
    if (key) {
      setDraft((current) => ({ ...current, [key]: '' }));
      setApplied((current) => ({ ...current, [key]: '' }));
    } else {
      setDraft(defaultDeviceFilter);
      setApplied(defaultDeviceFilter);
    }
    setPage(K_SIZE_1);
  };
  const remove = useCallback(
    (record: MeasuringDevice) =>
      showDialog({
        title: 'Xác nhận xoá',
        content: `Bạn có chắc chắn xoá TU/TI ${record.deviceCode}?`,
        type: TYPE_MESSAGE.ALERT,
        actions: [
          {
            title: 'Đồng ý',
            type: TYPE_ACTION.PRIMARY,
            onPress: () =>
              dispatch({
                type: DELETE_MEASURING_DEVICE,
                payload: {
                  body: { id: record.id },
                  onSuccess: () => {
                    showToast({ type: TYPE_TOAST.SUCCESS, content: 'Xoá TU/TI thành công' });
                    if (items.length === K_SIZE_1 && page > K_SIZE_1) setPage(page - K_SIZE_1);
                    else fetchList(page);
                  },
                  onFailed: (error?: ErrorBase) =>
                    showToast({
                      type: TYPE_TOAST.ERROR,
                      content: getDeviceError(error, 'Xoá TU/TI thất bại')
                    })
                }
              })
          },
          { title: 'Hủy', type: TYPE_ACTION.SECONDARY }
        ]
      }),
    [fetchList, items.length, page]
  );
  const columns = useMemo<any[]>(
    () => [
      {
        title: 'STT',
        key: 'index',
        width: 70,
        align: 'center',
        render: (_: unknown, __: MeasuringDevice, index: number) =>
          (page - K_SIZE_1) * DEFAULT_PAGE_SIZE + index + K_SIZE_1
      },
      {
        title: 'Mã TU/TI',
        dataIndex: 'deviceCode',
        width: K_SIZE_150,
        render: (value: string, record: MeasuringDevice) => (
          <TextBase
            text={value || NULL_VALUE}
            classNames="sub-title4 cursor-pointer !text-secondary-500"
            onClick={() => router.push(`${ROUTES.MEASURING_DEVICE_DETAIL}?id=${record.id}`)}
          />
        )
      },
      { title: 'Số sê-ri', dataIndex: 'serialNumber', width: K_SIZE_150, render: text },
      { title: 'Loại', dataIndex: 'deviceType', width: K_SIZE_150, render: getDeviceTypeLabel },
      { title: 'Hãng sản xuất', dataIndex: 'manufacturer', width: K_SIZE_150, render: text },
      { title: 'Model', dataIndex: 'model', width: K_SIZE_150, render: text },
      { title: 'Tỷ số biến', dataIndex: 'ratio', width: K_SIZE_120, render: text },
      { title: 'Cấp chính xác', dataIndex: 'accuracyClass', width: K_SIZE_120, render: text },
      {
        title: 'Ngày lắp đặt',
        dataIndex: 'installedDate',
        width: K_SIZE_140,
        render: renderDeviceDate
      },
      {
        title: 'Hạn kiểm định',
        dataIndex: 'inspectionDueDate',
        width: K_SIZE_140,
        render: renderDeviceDate
      },
      {
        title: 'Trạng thái',
        dataIndex: 'status',
        width: K_SIZE_140,
        render: (value: string) => (
          <Status
            kind={KIND_STATUS.SECONDARY}
            type={getDeviceStatusType(value)}
            content={getDeviceStatusLabel(value)}
          />
        )
      },
      {
        title: 'Thao tác',
        fixed: 'right',
        width: K_SIZE_120,
        align: 'center',
        render: (_: unknown, record: MeasuringDevice) => (
          <div className="flex justify-center gap-8">
            <IconHover
              title="Xem chi tiết"
              icon="ICON_EYE_OPEN"
              iconHeight={K_SIZE_18}
              onClick={() => router.push(`${ROUTES.MEASURING_DEVICE_DETAIL}?id=${record.id}`)}
            />
            <IconHover
              title="Sửa"
              icon="ICON_EDIT"
              iconHeight={K_SIZE_18}
              onClick={() => router.push(`${ROUTES.MEASURING_DEVICE_EDIT}?id=${record.id}`)}
            />
            <IconHover
              title="Xoá"
              icon="IC_TRASH_OUTLINE"
              iconHeight={K_SIZE_18}
              rootClassName="text-error-500"
              onClick={() => remove(record)}
            />
          </div>
        )
      }
    ],
    [page, remove, router]
  );
  const active = Object.entries(applied).filter(([, value]) => Boolean(value)) as [
    keyof MeasuringDeviceFilter,
    string
  ][];
  const display = (key: keyof MeasuringDeviceFilter, value: string) =>
    key === 'deviceType'
      ? getDeviceTypeLabel(value)
      : key === 'status'
        ? getDeviceStatusLabel(value)
        : value;
  return (
    <PageWithBreadcrumb
      breadcrumbList={[
        { title: 'Thiết bị' },
        { title: 'Quản lý TU/TI', key: ROUTES.MEASURING_DEVICE_MANAGEMENT }
      ]}
    >
      <section>
        <Flex
          justify="space-between"
          align="center"
          gap={K_SIZE_8}
          className="mobile:flex-col mobile:items-start"
        >
          <div>
            <TextBase classNames="title4" text="Quản lý TU/TI" />
            <TextBase
              classNames="body3 !text-color-700"
              text={`Theo dõi ${total} thiết bị TU/TI`}
            />
          </div>
          <ButtonBase
            type="primary"
            leftIcon="IC_ADD_OUTLINE2"
            customContent="Thêm TU/TI"
            onClick={() => router.push(ROUTES.MEASURING_DEVICE_ADD)}
          />
        </Flex>
        <Divider className="my-16" />
        <div className="mb-12 grid grid-cols-[repeat(4,minmax(160px,1fr))_auto] items-end gap-12 rounded-radius-l border border-color-300 bg-color-50 p-12 desktop:grid-cols-2 tablet:grid-cols-2 mobile:grid-cols-1">
          <AppTextField
            name="deviceCode"
            label="Mã TU/TI"
            placeholder="Nhập mã TU/TI"
            value={draft.deviceCode}
            onChange={(event) => update('deviceCode', event.target.value)}
            onPressEnter={apply}
          />
          <AppTextField
            name="serialNumber"
            label="Số sê-ri"
            placeholder="Nhập số sê-ri"
            value={draft.serialNumber}
            onChange={(event) => update('serialNumber', event.target.value)}
            onPressEnter={apply}
          />
          <AppSelect
            name="deviceType"
            label="Loại"
            placeholder="Chọn loại"
            value={draft.deviceType}
            options={DEVICE_TYPE_OPTIONS}
            onSelectOption={({ key }) => update('deviceType', String(key))}
          />
          <AppSelect
            name="status"
            label="Trạng thái"
            placeholder="Chọn trạng thái"
            value={draft.status}
            options={DEVICE_STATUS_OPTIONS}
            onSelectOption={({ key }) => update('status', String(key))}
          />
          <Flex justify="end" gap={K_SIZE_8} className="col-span-full">
            <ButtonBase type="ghost" customContent="Xoá bộ lọc" onClick={() => reset()} />
            <ButtonBase
              type="primary"
              leftIcon="IC_SEARCH_OUTLINE2"
              customContent="Tìm kiếm"
              onClick={apply}
            />
          </Flex>
        </div>
        {active.length > K_SIZE_0 && (
          <div className="mb-8 flex flex-wrap gap-8">
            {active.map(([key, value]) => (
              <TagFilter
                key={key}
                content={`${filterLabels[key]}: ${display(key, value)}`}
                onClose={() => reset(key)}
              />
            ))}
          </div>
        )}
        <div className="overflow-hidden rounded-radius-l border border-color-400">
          <AppTable
            loading={loading}
            rootClassName="w-full"
            className="[&_.ant-pagination]:hidden"
            scroll={{ x: 'max-content', y: '68vh' }}
            dataSource={items}
            columns={columns}
            rowKey="id"
            pagination={pagination}
          />
        </div>
        <AppPagination currentPage={page} total={total} pagination={pagination} />
      </section>
    </PageWithBreadcrumb>
  );
}
