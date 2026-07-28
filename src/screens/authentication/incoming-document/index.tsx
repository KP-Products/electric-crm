'use client';

import {
  DEFAULT_PAGE_SIZE,
  K_SIZE_0,
  K_SIZE_1,
  K_SIZE_100,
  K_SIZE_120,
  K_SIZE_130,
  K_SIZE_140,
  K_SIZE_160,
  K_SIZE_18,
  K_SIZE_200,
  K_SIZE_240,
  K_SIZE_80,
  K_SIZE_8,
  NULL_VALUE
} from '@constant';
import { Divider, Flex, Spin } from 'antd';
import ButtonBase from 'components/button';
import IconHover from 'components/icon-vec-local/icon-hover';
import { AppSelect } from 'components/select';
import Status, { KIND_STATUS } from 'components/status';
import AppTable from 'components/table';
import AppPagination from 'components/table/pagination';
import TagFilter from 'components/tag-filter';
import { TextBase } from 'components/text';
import { AppTextField } from 'components/text-field';
import PageWithBreadcrumb from 'layout/AppLayout/PageWithBreadcumb';
import { IncomingDocument } from 'model/incoming-document';
import { useMemo } from 'react';
import { displayDateFromServer } from 'utils/date';
import useIncomingDocuments, { IncomingDocumentFilterForm } from './useIncomingDocuments';
import {
  CONFIDENTIALITY_LEVEL_OPTIONS,
  INCOMING_DOCUMENT_TYPE_FILTER_OPTIONS,
  URGENCY_LEVEL_OPTIONS,
  getConfidentialityLevelLabel,
  getConfidentialityLevelStatusType,
  getIncomingDocumentTypeLabel,
  getUrgencyLevelLabel,
  getUrgencyLevelStatusType
} from './utils';

const FILTER_LABEL_MAP: Record<keyof IncomingDocumentFilterForm, string> = {
  incomingNumber: 'Số đến',
  issuingAgency: 'Cơ quan ban hành',
  documentType: 'Loại văn bản',
  urgencyLevel: 'Độ khẩn',
  confidentialityLevel: 'Độ mật'
};

const displayText = (value?: string | number | null) => {
  if (value === undefined || value === null || value === '') return NULL_VALUE;
  return String(value);
};

const getFilterDisplayValue = (key: keyof IncomingDocumentFilterForm, value: string) => {
  if (key === 'documentType') return getIncomingDocumentTypeLabel(value);
  if (key === 'urgencyLevel') return getUrgencyLevelLabel(value);
  if (key === 'confidentialityLevel') return getConfidentialityLevelLabel(value);
  return value;
};

const IncomingDocumentScreen = () => {
  const {
    t,
    incomingDocumentList,
    total,
    listLoading,
    currentPage,
    pagination,
    filter,
    filterApplied,
    onChangeFilter,
    onApplyFilter,
    onResetFilter,
    onOpenCreate,
    onOpenUpdate,
    onDelete,
    onViewAttachment,
    onDownloadAttachment
  } = useIncomingDocuments();

  const activeFilters = useMemo(
    () =>
      (Object.entries(filterApplied) as [keyof IncomingDocumentFilterForm, string][]).filter(
        ([, value]) => Boolean(value)
      ),
    [filterApplied]
  );

  const columns = useMemo<any[]>(
    () => [
      {
        title: 'STT',
        key: 'index',
        width: K_SIZE_80,
        align: 'center',
        render: (_: unknown, __: IncomingDocument, index: number) =>
          (currentPage - K_SIZE_1) * DEFAULT_PAGE_SIZE + index + K_SIZE_1
      },
      {
        title: 'Số đến',
        dataIndex: 'incomingNumber',
        key: 'incomingNumber',
        width: K_SIZE_120,
        render: (text: string) => displayText(text)
      },
      {
        title: 'Ngày đến',
        dataIndex: 'incomingDate',
        key: 'incomingDate',
        width: K_SIZE_130,
        render: (date: string) => displayDateFromServer(date)
      },
      {
        title: 'Số/Ký hiệu văn bản',
        dataIndex: 'documentNumber',
        key: 'documentNumber',
        width: K_SIZE_160,
        render: (text: string) => displayText(text)
      },
      {
        title: 'Ngày văn bản',
        dataIndex: 'documentDate',
        key: 'documentDate',
        width: K_SIZE_130,
        render: (date: string) => displayDateFromServer(date)
      },
      {
        title: 'Cơ quan ban hành',
        dataIndex: 'issuingAgency',
        key: 'issuingAgency',
        width: K_SIZE_200,
        render: (text: string) => displayText(text)
      },
      {
        title: 'Loại văn bản',
        dataIndex: 'documentType',
        key: 'documentType',
        width: K_SIZE_140,
        render: (text: string) => displayText(getIncomingDocumentTypeLabel(text))
      },
      {
        title: 'Trích yếu nội dung',
        dataIndex: 'summary',
        key: 'summary',
        width: K_SIZE_240,
        render: (text: string) => (
          <div title={text} className="max-w-[280px] truncate">
            {displayText(text)}
          </div>
        )
      },
      {
        title: 'Độ khẩn',
        dataIndex: 'urgencyLevel',
        key: 'urgencyLevel',
        width: K_SIZE_120,
        render: (value: string) => (
          <Status
            type={getUrgencyLevelStatusType(value)}
            kind={KIND_STATUS.SECONDARY}
            content={displayText(getUrgencyLevelLabel(value))}
          />
        )
      },
      {
        title: 'Độ mật',
        dataIndex: 'confidentialityLevel',
        key: 'confidentialityLevel',
        width: K_SIZE_120,
        render: (value: string) => (
          <Status
            type={getConfidentialityLevelStatusType(value)}
            kind={KIND_STATUS.SECONDARY}
            content={displayText(getConfidentialityLevelLabel(value))}
          />
        )
      },
      {
        title: 'Hạn xử lý',
        dataIndex: 'dueDate',
        key: 'dueDate',
        width: K_SIZE_130,
        render: (date: string) => displayDateFromServer(date)
      },
      {
        title: 'Người tạo',
        dataIndex: 'createdBy',
        key: 'createdBy',
        width: K_SIZE_120,
        render: (createdBy: number) => displayText(createdBy)
      },
      {
        title: 'File văn bản',
        dataIndex: 'filePath',
        key: 'filePath',
        width: K_SIZE_120,
        align: 'center',
        render: (_: string, record: IncomingDocument) =>
          record.filePath ? (
            <div className="flex justify-center gap-8">
              <IconHover
                rootClassName="text-color-800"
                title="Xem file"
                icon="ICON_EYE_OPEN"
                iconHeight={K_SIZE_18}
                onClick={() => onViewAttachment(record)}
              />
              <IconHover
                rootClassName="text-color-800"
                title="Tải file"
                icon="IC_DOWNLOAD_OUTLINE"
                iconHeight={K_SIZE_18}
                onClick={() => onDownloadAttachment(record)}
              />
            </div>
          ) : (
            NULL_VALUE
          )
      },
      {
        title: t('common:action'),
        fixed: 'right',
        align: 'center',
        width: K_SIZE_100,
        render: (_: unknown, record: IncomingDocument) => (
          <div className="flex justify-center gap-8">
            <IconHover
              rootClassName="text-color-800"
              title={t('common:edit')}
              icon="ICON_EDIT"
              iconHeight={K_SIZE_18}
              onClick={() => onOpenUpdate(record)}
            />
            <IconHover
              rootClassName="text-error-500 hover:text-error-500"
              title={t('common:delete')}
              icon="IC_TRASH_OUTLINE"
              iconHeight={K_SIZE_18}
              onClick={() => onDelete(record)}
            />
          </div>
        )
      }
    ],
    [currentPage, onDelete, onDownloadAttachment, onOpenUpdate, onViewAttachment, t]
  );

  return (
    <PageWithBreadcrumb>
      <section>
        <Flex
          justify="space-between"
          align="center"
          gap={K_SIZE_8}
          className="mobile:flex-col mobile:items-start"
        >
          <TextBase classNames="title4" text="Danh sách văn bản đến" />
          <ButtonBase
            type="primary"
            leftIcon="IC_ADD_OUTLINE2"
            customContent="Thêm văn bản đến"
            onClick={onOpenCreate}
            classNames="mobile:w-full mobile:justify-center"
          />
        </Flex>
        <Divider className="my-16" />

        <div className="mb-12 grid grid-cols-[minmax(150px,0.8fr)_minmax(220px,1.1fr)_minmax(160px,0.9fr)_minmax(140px,0.75fr)_minmax(140px,0.75fr)_auto] items-end gap-12 rounded-radius-l border border-color-300 bg-color-50 p-12 tablet:grid-cols-2 mobile:grid-cols-1">
          <AppTextField
            name="incomingNumber"
            label="Số đến"
            placeholder="Nhập số đến"
            value={filter.incomingNumber}
            onChange={(event) => onChangeFilter('incomingNumber', event.target.value)}
            onPressEnter={onApplyFilter}
          />
          <AppTextField
            name="issuingAgency"
            label="Cơ quan ban hành"
            placeholder="Nhập cơ quan ban hành"
            value={filter.issuingAgency}
            onChange={(event) => onChangeFilter('issuingAgency', event.target.value)}
            onPressEnter={onApplyFilter}
          />
          <AppSelect
            name="documentType"
            label="Loại văn bản"
            placeholder="-- Tất cả --"
            value={filter.documentType}
            options={INCOMING_DOCUMENT_TYPE_FILTER_OPTIONS}
            onSelectOption={({ key }) => onChangeFilter('documentType', String(key))}
          />
          <AppSelect
            name="urgencyLevel"
            label="Độ khẩn"
            value={filter.urgencyLevel}
            options={URGENCY_LEVEL_OPTIONS}
            onSelectOption={({ key }) => onChangeFilter('urgencyLevel', String(key))}
          />
          <AppSelect
            name="confidentialityLevel"
            label="Độ mật"
            value={filter.confidentialityLevel}
            options={CONFIDENTIALITY_LEVEL_OPTIONS}
            onSelectOption={({ key }) => onChangeFilter('confidentialityLevel', String(key))}
          />
          <Flex gap={K_SIZE_8} className="tablet:col-span-2 mobile:col-span-1">
            <ButtonBase
              type="ghost"
              customContent="Làm mới"
              onClick={() => onResetFilter()}
              classNames="min-w-[104px] mobile:flex-1 mobile:justify-center"
            />
            <ButtonBase
              type="primary"
              leftIcon="IC_SEARCH_OUTLINE2"
              customContent="Tìm kiếm"
              onClick={onApplyFilter}
              classNames="min-w-[112px] mobile:flex-1 mobile:justify-center"
            />
          </Flex>
        </div>

        {activeFilters.length > K_SIZE_0 && (
          <div className="mb-8 flex w-full flex-wrap items-center gap-8">
            {activeFilters.map(([key, value]) => (
              <TagFilter
                key={key}
                content={`${FILTER_LABEL_MAP[key]}: ${getFilterDisplayValue(key, value)}`}
                onClose={() => onResetFilter(key)}
              />
            ))}
          </div>
        )}

        <Spin spinning={listLoading && incomingDocumentList.length > K_SIZE_0}>
          <div className="overflow-hidden rounded-radius-l border border-color-400 duration-500">
            <AppTable
              loading={listLoading}
              rootClassName="w-full"
              className="[&_.ant-pagination]:hidden"
              scroll={{ x: 'max-content', y: '75vh' }}
              dataSource={incomingDocumentList}
              columns={columns}
              rowKey="id"
              pagination={pagination}
            />
          </div>
          <AppPagination currentPage={currentPage} total={total} pagination={pagination} />
        </Spin>
      </section>
    </PageWithBreadcrumb>
  );
};

export default IncomingDocumentScreen;
