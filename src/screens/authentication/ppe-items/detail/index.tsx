'use client';

import {
  DEFAULT_PAGE_SIZE,
  K_SIZE_0,
  K_SIZE_1,
  K_SIZE_100,
  K_SIZE_120,
  K_SIZE_140,
  K_SIZE_150,
  K_SIZE_200,
  K_SIZE_220,
  K_SIZE_24,
  K_SIZE_8,
  NULL_VALUE
} from '@constant';
import { Divider, Flex, Spin } from 'antd';
import { IconSvgLocal } from 'components/icon-vec-local';
import Status, { KIND_STATUS } from 'components/status';
import AppTable from 'components/table';
import AppPagination from 'components/table/pagination';
import { TextBase } from 'components/text';
import { ROUTES } from 'config/routes';
import PageWithBreadcrumb from 'layout/AppLayout/PageWithBreadcumb';
import { ErrorBase } from 'model/common';
import { PpeItem } from 'model/ppe-item';
import { PpeItemHistory } from 'model/ppe-item-history';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import ppeItemHistoryServices from 'services/ppe-item-history-services';
import ppeItemServices from 'services/ppe-item-services';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import {
  getHistoryTypeLabel,
  getHistoryTypeStatus,
  renderPpeItemHistoryDate,
  renderPpeItemHistoryNumber
} from 'screens/authentication/ppe-item-history/utils';
import {
  getPpeItemCreator,
  getPpeItemErrorMessage,
  getPpeItemStatusLabel,
  getPpeItemStatusType,
  renderPpeItemDate,
  renderPpeItemNumber
} from '../utils';

const renderText = (value?: string | number | null) =>
  value === undefined || value === null || value === '' ? NULL_VALUE : String(value);

const renderTruncatedText = (value?: string | number | null, className = 'max-w-[220px]') => (
  <div title={value ? String(value) : ''} className={`${className} truncate`}>
    {renderText(value)}
  </div>
);

const getStockQuantity = (item?: PpeItem) => {
  if (!item || item.quantity === undefined || item.quantity === null) return undefined;
  return item.quantity - (item.initQuantity ?? K_SIZE_0);
};

const getEmployeeDisplay = (name?: string, id?: number) => name || (id ? String(id) : NULL_VALUE);

const PpeItemDetailScreen = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id') || '';
  const itemId = Number(id);
  const [detail, setDetail] = useState<PpeItem>();
  const [detailLoading, setDetailLoading] = useState(false);
  const [historyList, setHistoryList] = useState<PpeItemHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyTotal, setHistoryTotal] = useState(K_SIZE_0);
  const [currentPage, setCurrentPage] = useState(K_SIZE_1);

  const fetchDetail = useCallback(async () => {
    if (!Number.isFinite(itemId) || itemId <= K_SIZE_0) {
      router.replace(ROUTES.PPE_ITEMS);
      return;
    }

    setDetailLoading(true);
    const response = await ppeItemServices.getPpeItemDetail({ id: itemId });
    setDetailLoading(false);

    if (!response || !response.data) {
      showToast({
        type: TYPE_TOAST.ERROR,
        content: getPpeItemErrorMessage(
          response as ErrorBase,
          'Tải chi tiết bảo hộ lao động thất bại'
        )
      });
      router.replace(ROUTES.PPE_ITEMS);
      return;
    }

    setDetail(response.data);
  }, [itemId, router]);

  const fetchHistory = useCallback(
    async (page: number) => {
      if (!Number.isFinite(itemId) || itemId <= K_SIZE_0) return;

      setHistoryLoading(true);
      const response = await ppeItemHistoryServices.searchPpeItemHistory({
        page: page - K_SIZE_1,
        size: DEFAULT_PAGE_SIZE,
        ppeItemId: itemId
      });
      setHistoryLoading(false);

      if (!response || !response.data) {
        setHistoryList([]);
        setHistoryTotal(K_SIZE_0);
        showToast({
          type: TYPE_TOAST.ERROR,
          content:
            response?.businessErrorMessage ||
            response?.systemErrorMessage ||
            'Tải lịch sử bàn giao thiết bị thất bại'
        });
        return;
      }

      setHistoryList(response.data.items || []);
      setHistoryTotal(response.data.total || K_SIZE_0);
    },
    [itemId]
  );

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  useEffect(() => {
    fetchHistory(currentPage);
  }, [currentPage, fetchHistory]);

  const historyPagination = useMemo(
    () => ({
      current: currentPage,
      total: historyTotal,
      pageSize: DEFAULT_PAGE_SIZE,
      onChange: (page: number) => setCurrentPage(page),
      showSizeChanger: false
    }),
    [currentPage, historyTotal]
  );

  const historyColumns = useMemo<any[]>(
    () => [
      {
        title: 'STT',
        key: 'index',
        width: K_SIZE_100,
        align: 'center',
        render: (_: unknown, __: PpeItemHistory, index: number) =>
          (currentPage - K_SIZE_1) * DEFAULT_PAGE_SIZE + index + K_SIZE_1
      },
      {
        title: 'Nhân viên nhận',
        dataIndex: 'employeeId',
        key: 'employeeId',
        width: K_SIZE_200,
        render: (employeeId: number, record: PpeItemHistory) =>
          renderTruncatedText(getEmployeeDisplay(record.employeeName, employeeId), 'max-w-[220px]')
      },
      {
        title: 'Ngày bàn giao',
        dataIndex: 'exportDate',
        key: 'exportDate',
        width: K_SIZE_140,
        render: renderPpeItemHistoryDate
      },
      {
        title: 'Số lượng',
        dataIndex: 'quantity',
        key: 'quantity',
        align: 'right',
        width: K_SIZE_120,
        render: renderPpeItemHistoryNumber
      },
      {
        title: 'Loại bàn giao',
        dataIndex: 'type',
        key: 'type',
        width: K_SIZE_150,
        render: (type: string) => (
          <Status
            type={getHistoryTypeStatus(type)}
            kind={KIND_STATUS.SECONDARY}
            content={getHistoryTypeLabel(type)}
          />
        )
      },
      {
        title: 'Nhân viên bàn giao',
        dataIndex: 'exportEmployeeId',
        key: 'exportEmployeeId',
        width: K_SIZE_200,
        render: (employeeId: number, record: PpeItemHistory) =>
          renderTruncatedText(
            getEmployeeDisplay(record.exportEmployeeName, employeeId),
            'max-w-[220px]'
          )
      },
      {
        title: 'Ghi chú',
        dataIndex: 'note',
        key: 'note',
        width: K_SIZE_220,
        render: (note?: string) => renderTruncatedText(note, 'max-w-[260px]')
      }
    ],
    [currentPage]
  );

  const detailRows = useMemo(
    () => [
      { label: 'Mã thiết bị', value: detail?.itemCode },
      { label: 'Tên thiết bị', value: detail?.itemName },
      { label: 'Loại vật tư', value: detail?.category },
      { label: 'Đơn vị tính', value: detail?.unit },
      { label: 'Số lượng ban đầu', value: renderPpeItemNumber(detail?.initQuantity) },
      { label: 'Số lượng tồn', value: renderPpeItemNumber(getStockQuantity(detail)) },
      { label: 'Ngày nhập kho', value: renderPpeItemDate(detail?.importDate) },
      { label: 'Người nhập kho', value: getPpeItemCreator(detail || ({} as PpeItem)) },
      { label: 'Ghi chú', value: detail?.note }
    ],
    [detail]
  );

  const breadcrumbList = [
    {
      title: 'Thiết bị'
    },
    {
      title: 'Quản lý bảo hộ lao động',
      key: ROUTES.PPE_ITEMS
    },
    {
      title: 'Chi tiết bảo hộ lao động'
    }
  ];

  return (
    <PageWithBreadcrumb breadcrumbList={breadcrumbList}>
      <section>
        <Flex
          justify="space-between"
          align="center"
          gap={K_SIZE_8}
          className="mobile:flex-col mobile:items-start"
        >
          <div className="flex items-center gap-8">
            <IconSvgLocal
              classNames="cursor-pointer"
              name="ICON_ARROW_LINE_LEFT"
              height={K_SIZE_24}
              width={K_SIZE_24}
              onClick={() => router.back()}
            />
            <div>
              <TextBase classNames="title4" text="Chi tiết bảo hộ lao động" />
              <TextBase
                classNames="body3 !text-color-700"
                text={detail?.itemCode ? `${detail.itemCode} - ${detail.itemName || ''}` : ''}
              />
            </div>
          </div>
        </Flex>
        <Divider className="my-16" />

        <Spin spinning={detailLoading}>
          <div className="mb-16 rounded-radius-l border border-color-300 bg-color-50 p-16">
            <Flex justify="space-between" align="center" gap={K_SIZE_8} className="mb-12">
              <TextBase classNames="sub-title3 !text-primary-700" text="Thông tin thiết bị" />
              <Status
                type={getPpeItemStatusType(detail?.status)}
                kind={KIND_STATUS.SECONDARY}
                content={getPpeItemStatusLabel(detail?.status)}
              />
            </Flex>
            <div className="grid grid-cols-3 gap-x-24 gap-y-16 tablet:grid-cols-2 mobile:grid-cols-1">
              {detailRows.map((row) => (
                <div key={row.label} className="min-w-0">
                  <TextBase classNames="body4 !text-color-700" text={row.label} />
                  <div className="mt-4 truncate text-14 font-semibold text-color-900">
                    {renderText(row.value)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Spin>

        <div className="mb-12">
          <Flex justify="space-between" align="center" gap={K_SIZE_8} className="mb-12">
            <div>
              <TextBase classNames="sub-title3 !text-primary-700" text="Lịch sử bàn giao" />
              <TextBase
                classNames="body4 !text-color-700"
                text={`Hiển thị ${historyList.length} / ${historyTotal} lượt bàn giao`}
              />
            </div>
          </Flex>
          <Spin spinning={historyLoading && historyList.length > K_SIZE_0}>
            <div className="overflow-hidden rounded-radius-l border border-color-400 duration-500">
              <AppTable
                loading={historyLoading}
                rootClassName="w-full"
                className="[&_.ant-pagination]:hidden"
                scroll={{ x: 'max-content', y: '56vh' }}
                dataSource={historyList}
                columns={historyColumns}
                rowKey={(record: any) => String(record.id)}
                pagination={historyPagination}
              />
            </div>
            <AppPagination
              currentPage={currentPage}
              total={historyTotal}
              pagination={historyPagination}
            />
          </Spin>
        </div>
      </section>
    </PageWithBreadcrumb>
  );
};

export default PpeItemDetailScreen;
