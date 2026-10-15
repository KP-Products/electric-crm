'use client';

import {
  K_SIZE_1,
  K_SIZE_100,
  K_SIZE_120,
  K_SIZE_160,
  K_SIZE_200,
  K_SIZE_24,
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
import { DocumentItem } from 'model/document';
import { ReactNode, useMemo } from 'react';
import { displayDateTimeFromServer } from 'utils/date';
import {
  DOCUMENT_TYPE_LABEL_MAP,
  displayText,
  getOperationContractStatusMeta,
  renderOperationContractDate,
  formatVnd
} from '../utils';
import useOperationContractDetail from '../hooks/useOperationContractDetail';

const DetailItem = ({ label, value }: { label: string; value: ReactNode }) => (
  <div className="min-w-0">
    <div className="mb-4 text-12 font-semibold text-color-700">{label}</div>
    <div className="break-words text-14 font-medium text-color-900">{value || '-'}</div>
  </div>
);

const renderTruncatedText = (text?: string | null, className = 'max-w-[220px]') => (
  <div title={text || ''} className={`${className} truncate`}>
    {displayText(text)}
  </div>
);

const ManageOperationContractDetailScreen = () => {
  const {
    selectedContract,
    detailLoading,
    documentList,
    documentLoading,
    onBack,
    onEdit,
    onViewDocument,
    onDownloadDocument
  } = useOperationContractDetail();

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
        render: (text: string) => renderTruncatedText(text, 'max-w-[260px]')
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
            type="ghost"
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
            type="ghost"
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

  const statusMeta = getOperationContractStatusMeta(selectedContract?.status);

  const breadcrumbList = [
    {
      title: 'Hợp đồng'
    },
    {
      title: 'Quản lý hợp đồng vận hành',
      key: ROUTES.MANAGE_OPERATION_CONTRACT
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
          className="min-h-44 tablet:min-h-0 tablet:flex-col tablet:items-start"
        >
          <div className="flex items-center gap-8">
            <IconSvgLocal
              classNames="cursor-pointer"
              name="ICON_ARROW_LINE_LEFT"
              height={K_SIZE_24}
              width={K_SIZE_24}
              onClick={onBack}
            />
            <TextBase classNames="title4" text="Chi tiết hợp đồng vận hành" />
          </div>
          <Flex gap={K_SIZE_8} className="mobile:w-full mobile:flex-col">
            <ButtonBase
              type="ghost"
              customContent="Quay lại"
              onClick={onBack}
              classNames="mobile:flex-1 mobile:justify-center"
            />
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
            <TextBase classNames="sub-title3 mb-16 !text-primary-700" text="Thông tin hợp đồng" />
            <div className="grid grid-cols-3 gap-x-24 gap-y-[18px] tablet:grid-cols-2 mobile:grid-cols-1">
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
                label="Tên hợp đồng"
                value={displayText(selectedContract?.contractName)}
              />
              <DetailItem
                label="Khách hàng"
                value={displayText(
                  [selectedContract?.customerCode, selectedContract?.customerName]
                    .filter(Boolean)
                    .join(' - ')
                )}
              />
              <DetailItem
                label="Giá trị hợp đồng"
                value={formatVnd(selectedContract?.contractValue)}
              />
              <DetailItem
                label="Chiết khấu"
                value={
                  selectedContract?.discountPercent != null
                    ? `${selectedContract.discountPercent}%`
                    : '-'
                }
              />
              <DetailItem
                label="Giá trị sau chiết khấu"
                value={formatVnd(selectedContract?.valueAfterDiscount)}
              />
              <DetailItem
                label="Loại hợp đồng"
                value={displayText(selectedContract?.contractType)}
              />
              <DetailItem
                label="Ngày ký"
                value={renderOperationContractDate(selectedContract?.signedDate)}
              />
              <DetailItem
                label="Ngày hiệu lực"
                value={renderOperationContractDate(selectedContract?.effectiveDate)}
              />
              <DetailItem
                label="Ngày hết hạn"
                value={renderOperationContractDate(selectedContract?.expiryDate)}
              />
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
              <DetailItem
                label="Người tạo"
                value={displayText(selectedContract?.createdByUsername)}
              />
              <DetailItem
                label="Ngày tạo"
                value={displayDateTimeFromServer(selectedContract?.createdAt || '')}
              />
              <DetailItem
                label="Người cập nhật"
                value={displayText(selectedContract?.updatedByUsername)}
              />
              <DetailItem
                label="Ngày cập nhật"
                value={displayDateTimeFromServer(selectedContract?.updatedAt || '')}
              />
              <div className="col-span-3 tablet:col-span-2 mobile:col-span-1">
                <DetailItem label="Ghi chú" value={displayText(selectedContract?.note)} />
              </div>
            </div>
          </section>
        </Spin>

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

export default ManageOperationContractDetailScreen;
