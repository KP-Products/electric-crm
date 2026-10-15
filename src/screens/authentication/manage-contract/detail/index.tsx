'use client';

import {
  K_SIZE_1,
  K_SIZE_24,
  K_SIZE_100,
  K_SIZE_120,
  K_SIZE_160,
  K_SIZE_200,
  K_SIZE_8
} from '@constant';
import { Divider, Flex, Spin } from 'antd';
import ButtonBase from 'components/button';
import { IconSvgLocal } from 'components/icon-vec-local';
import Status, { KIND_STATUS } from 'components/status';
import AppTable from 'components/table';
import { TextBase } from 'components/text';
import { ROUTES } from 'config/routes';
import PageWithBreadcrumb from 'layout/AppLayout/PageWithBreadcumb';
import { ContractMeter, ContractMeterChangeEvent } from 'model/contract';
import { DocumentItem } from 'model/document';
import { ReactNode, useMemo } from 'react';
import { displayDateTimeFromServer } from 'utils/date';
import { getVoltageLevelLabel } from 'screens/authentication/meter-management/utils/constant';
import useContractDetail from '../hooks/useContractDetail';
import {
  DOCUMENT_TYPE_LABEL_MAP,
  displayText,
  getContractStatusMeta,
  renderContractDate
} from '../utils';

const METER_CHANGE_TYPE_LABEL: Record<string, string> = {
  THAY_THE: 'Thay thế',
  THAO_GO: 'Tháo gỡ',
  LAP_MOI: 'Lắp mới'
};

const DetailItem = ({ label, value }: { label: string; value: ReactNode }) => (
  <div className="min-w-0">
    <div className="mb-4 text-14 font-semibold text-color-800">{label}</div>
    <div className="break-words text-14 font-medium text-color-900">{value || '-'}</div>
  </div>
);

const renderTruncatedText = (text?: string | null, className = 'max-w-[220px]') => (
  <div title={text || ''} className={`${className} truncate`}>
    {displayText(text)}
  </div>
);

const ManageContractDetailScreen = () => {
  const {
    selectedContract,
    detailLoading,
    documentList,
    documentLoading,
    getCustomerDisplay,
    onBack,
    onEdit,
    onViewDocument,
    onDownloadDocument
  } = useContractDetail();

  const meterColumns = useMemo<any[]>(
    () => [
      {
        title: 'STT',
        key: 'stt',
        width: 60,
        render: (_: unknown, __: unknown, index: number) => index + 1
      },
      { title: 'Công tơ', dataIndex: 'meterCode', key: 'meterCode', render: displayText },
      { title: 'Lộ', dataIndex: 'feederCode', key: 'feederCode', render: displayText },
      {
        title: 'Ngày lắp đặt',
        dataIndex: 'installationDate',
        key: 'installationDate',
        render: (value: string) => renderContractDate(value)
      },
      {
        title: 'Cấp điện áp',
        dataIndex: 'voltageLevel',
        key: 'voltageLevel',
        render: (value: string) => (value ? getVoltageLevelLabel(value) : '-')
      },
      { title: 'Hệ số nhân', dataIndex: 'multiplier', key: 'multiplier', render: displayText }
    ],
    []
  );

  const changeEventColumns = useMemo<any[]>(
    () => [
      { title: 'Số sự kiện', dataIndex: 'eventNo', key: 'eventNo', render: displayText },
      {
        title: 'Loại',
        dataIndex: 'eventType',
        key: 'eventType',
        render: (value: string) => METER_CHANGE_TYPE_LABEL[value] || displayText(value)
      },
      { title: 'Ngày', dataIndex: 'eventDate', key: 'eventDate', render: displayText },
      {
        title: 'Công tơ cũ → mới',
        key: 'devices',
        render: (_: unknown, record: ContractMeterChangeEvent) =>
          `${record.oldDevice || '-'} → ${record.newDevice || '-'}`
      },
      {
        title: 'Chỉ số tháo',
        dataIndex: 'removeReading',
        key: 'removeReading',
        render: displayText
      },
      {
        title: 'Chỉ số lắp',
        dataIndex: 'installReading',
        key: 'installReading',
        render: displayText
      },
      { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: displayText }
    ],
    []
  );

  const documentColumns = useMemo<any[]>(
    () => [
      {
        title: 'STT',
        key: 'index',
        width: K_SIZE_100,
        align: 'center',
        render: (_: unknown, __: DocumentItem, index: number) => index + K_SIZE_1
      },
      {
        title: 'Tên file',
        dataIndex: 'originalFileName',
        key: 'originalFileName',
        width: K_SIZE_200,
        render: (text: string) => renderTruncatedText(text, 'max-w-[280px]')
      },
      {
        title: 'Loại tài liệu',
        dataIndex: 'docType',
        key: 'docType',
        width: K_SIZE_160,
        render: (docType: string) => DOCUMENT_TYPE_LABEL_MAP[docType] || displayText(docType)
      },
      {
        title: 'Ngày upload',
        dataIndex: 'uploadedAt',
        key: 'uploadedAt',
        width: K_SIZE_200,
        render: (date: string) => displayDateTimeFromServer(date)
      },
      {
        title: 'Xem file',
        key: 'view',
        width: K_SIZE_120,
        align: 'center',
        render: (_: unknown, record: DocumentItem) => (
          <ButtonBase
            type="whiteGhost"
            size={32}
            leftIcon="ICON_EYE_OPEN"
            customContent="Xem"
            onClick={() => onViewDocument(record)}
          />
        )
      },
      {
        title: 'Tải xuống',
        key: 'download',
        width: K_SIZE_120,
        align: 'center',
        render: (_: unknown, record: DocumentItem) => (
          <ButtonBase
            type="whiteGhost"
            size={32}
            leftIcon="IC_DOWNLOAD_OUTLINE"
            customContent="Tải xuống"
            onClick={() => onDownloadDocument(record)}
          />
        )
      }
    ],
    [onDownloadDocument, onViewDocument]
  );

  const statusMeta = getContractStatusMeta(selectedContract?.status);

  const breadcrumbList = [
    {
      title: 'Trang chủ'
    },
    {
      title: 'Mua bán điện',
      key: ROUTES.MANAGE_CONTRACT
    },
    {
      title: 'Chi tiết hợp đồng'
    }
  ];

  return (
    <PageWithBreadcrumb breadcrumbList={breadcrumbList}>
      <section>
        <Flex
          justify="space-between"
          align="center"
          gap={K_SIZE_8}
          className="tablet:flex-col tablet:items-start"
        >
          <div className="flex items-center gap-8">
            <IconSvgLocal
              classNames="cursor-pointer"
              name="ICON_ARROW_LINE_LEFT"
              height={K_SIZE_24}
              width={K_SIZE_24}
              onClick={onBack}
            />
            <TextBase classNames="title4" text="Chi tiết hợp đồng mua bán điện" />
          </div>
          <Flex gap={K_SIZE_8} className="mobile:w-full mobile:flex-col">
            <ButtonBase
              type="primary"
              leftIcon="ICON_EDIT"
              customContent="Sửa hợp đồng"
              onClick={onEdit}
              classNames="mobile:flex-1 mobile:justify-center"
            />
          </Flex>
        </Flex>
        <Divider className="my-16" />

        <Spin spinning={detailLoading && !selectedContract}>
          <section className="rounded-radius-l border border-color-300 bg-color-50 p-16">
            <TextBase classNames="sub-title3 mb-24 !text-primary-700" text="Thông tin hợp đồng" />
            <div className="grid grid-cols-3 gap-x-32 gap-y-24 tablet:grid-cols-2 mobile:grid-cols-1">
              <DetailItem
                label="Số hợp đồng"
                value={
                  <TextBase
                    text={displayText(selectedContract?.contractNumber)}
                    classNames="sub-title4 !text-secondary-500"
                  />
                }
              />
              <DetailItem
                label="Ngày ký kết"
                value={renderContractDate(selectedContract?.signedDate)}
              />
              <DetailItem
                label="Ngày tạo hợp đồng"
                value={displayDateTimeFromServer(selectedContract?.createdAt || '')}
              />
              <DetailItem
                label="Khách hàng"
                value={
                  <TextBase
                    text={getCustomerDisplay(selectedContract?.customerId)}
                    classNames="sub-title4 !text-secondary-500"
                  />
                }
              />
              <DetailItem
                label="Ngày hiệu lực"
                value={renderContractDate(selectedContract?.effectiveDate)}
              />
              <DetailItem
                label="Ngày cập nhật hợp đồng"
                value={displayDateTimeFromServer(selectedContract?.updatedAt || '')}
              />
              <DetailItem
                label="Ngày hết hiệu lực"
                value={renderContractDate(selectedContract?.expiryDate)}
              />
              <DetailItem label="Ghi chú" value={displayText(selectedContract?.note)} />
              <DetailItem
                label="Trạng thái"
                value={
                  <Status
                    type={statusMeta.type}
                    kind={KIND_STATUS.PRIMARY}
                    content={statusMeta.label}
                  />
                }
              />
            </div>
          </section>
        </Spin>

        <section className="mt-16 rounded-radius-l border border-color-300 bg-color-50 p-16">
          <TextBase classNames="sub-title3 mb-16 !text-primary-700" text="Danh sách công tơ" />
          <div className="overflow-hidden rounded-radius-l border border-color-400">
            <AppTable
              loading={detailLoading}
              rootClassName="w-full"
              scroll={{ x: 'max-content' }}
              dataSource={selectedContract?.meters || []}
              columns={meterColumns}
              rowKey={(record: any) => (record as ContractMeter).meterId}
              pagination={false}
            />
          </div>
        </section>

        <section className="mt-16 rounded-radius-l border border-color-300 bg-color-50 p-16">
          <TextBase classNames="sub-title3 mb-16 !text-primary-700" text="Biến động công tơ" />
          <div className="overflow-hidden rounded-radius-l border border-color-400">
            <AppTable
              loading={detailLoading}
              rootClassName="w-full"
              scroll={{ x: 'max-content' }}
              dataSource={selectedContract?.meterChangeEvents || []}
              columns={changeEventColumns}
              rowKey={(record: any) => {
                const event = record as ContractMeterChangeEvent;
                return `${event.eventId}-${event.oldDevice}-${event.newDevice}`;
              }}
              pagination={false}
            />
          </div>
        </section>

        <section className="mt-16 rounded-radius-l border border-color-300 bg-color-50 p-16">
          <Flex justify="space-between" align="center" className="mb-16">
            <TextBase
              classNames="sub-title3 !text-primary-700"
              text="Danh sách tài liệu, file đính kèm"
            />
            {documentLoading && <Spin size="small" />}
          </Flex>
          <div className="overflow-hidden rounded-radius-l border border-color-400">
            <AppTable
              loading={documentLoading}
              rootClassName="w-full"
              scroll={{ x: 'max-content' }}
              dataSource={documentList}
              columns={documentColumns}
              rowKey={(record: any) => String(record.id)}
              pagination={false}
            />
          </div>
        </section>
      </section>
    </PageWithBreadcrumb>
  );
};

export default ManageContractDetailScreen;
