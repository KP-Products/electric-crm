'use client';

import {
  DEFAULT_PAGE_SIZE,
  K_SIZE_0,
  K_SIZE_1,
  K_SIZE_100,
  K_SIZE_120,
  K_SIZE_130,
  K_SIZE_18,
  K_SIZE_180,
  K_SIZE_200,
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
import { CompanyLegalDocument } from 'model/company-legal-document';
import { useMemo } from 'react';
import { displayDateFromServer } from 'utils/date';
import { CompanyLegalDocumentFilterForm } from './useCompanyLegalDocuments';
import useCompanyLegalDocuments from './useCompanyLegalDocuments';
import {
  COMPANY_LEGAL_DOCUMENT_STATUS_FILTER_OPTIONS,
  COMPANY_LEGAL_DOCUMENT_TYPE_FILTER_OPTIONS,
  getCompanyLegalDocumentStatusLabel,
  getCompanyLegalDocumentTypeLabel,
  getStatusType
} from './utils';

const FILTER_LABEL_MAP: Record<keyof CompanyLegalDocumentFilterForm, string> = {
  documentName: 'Tên văn bản',
  documentNumber: 'Số/Ký hiệu',
  documentType: 'Loại văn bản',
  status: 'Trạng thái'
};

const displayText = (value?: string | number | null) => {
  if (value === undefined || value === null || value === '') return NULL_VALUE;
  return String(value);
};

const getFilterDisplayValue = (key: keyof CompanyLegalDocumentFilterForm, value: string) => {
  if (key === 'documentType') return getCompanyLegalDocumentTypeLabel(value);
  if (key === 'status') return getCompanyLegalDocumentStatusLabel(value);
  return value;
};

const CompanyLegalDocumentScreen = () => {
  const {
    t,
    companyLegalDocumentList,
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
  } = useCompanyLegalDocuments();

  const activeFilters = useMemo(
    () =>
      (Object.entries(filterApplied) as [keyof CompanyLegalDocumentFilterForm, string][]).filter(
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
        render: (_: unknown, __: CompanyLegalDocument, index: number) =>
          (currentPage - K_SIZE_1) * DEFAULT_PAGE_SIZE + index + K_SIZE_1
      },
      {
        title: 'Mã văn bản',
        dataIndex: 'id',
        key: 'id',
        width: K_SIZE_100,
        render: (id: number) => displayText(id)
      },
      {
        title: 'Số/Ký hiệu',
        dataIndex: 'documentNumber',
        key: 'documentNumber',
        width: K_SIZE_180,
        render: (text: string) => displayText(text)
      },
      {
        title: 'Tên văn bản',
        dataIndex: 'documentName',
        key: 'documentName',
        width: K_SIZE_200,
        render: (text: string) => (
          <div title={text} className="max-w-[240px] truncate">
            {displayText(text)}
          </div>
        )
      },
      {
        title: 'Loại văn bản',
        dataIndex: 'documentType',
        key: 'documentType',
        width: K_SIZE_180,
        render: (text: string) => displayText(getCompanyLegalDocumentTypeLabel(text))
      },
      {
        title: 'Ngày văn bản',
        dataIndex: 'documentDate',
        key: 'documentDate',
        width: K_SIZE_130,
        render: (date: string) => displayDateFromServer(date)
      },
      {
        title: 'Ngày hiệu lực',
        dataIndex: 'effectiveDate',
        key: 'effectiveDate',
        width: K_SIZE_130,
        render: (date: string) => displayDateFromServer(date)
      },
      {
        title: 'Người soạn thảo',
        dataIndex: 'draftedByName',
        key: 'draftedByName',
        width: K_SIZE_130,
        render: (_: number, record: CompanyLegalDocument) =>
          displayText(record.draftedByName || record.draftedBy)
      },
      {
        title: 'Người ký duyệt',
        dataIndex: 'approvedBy',
        key: 'approvedBy',
        width: K_SIZE_130,
        render: (_: number, record: CompanyLegalDocument) =>
          displayText(record.approvedByName || record.approvedBy)
      },
      {
        title: 'Trạng thái',
        dataIndex: 'status',
        key: 'status',
        width: K_SIZE_120,
        render: (status: string) => (
          <Status
            type={getStatusType(status)}
            kind={KIND_STATUS.SECONDARY}
            content={displayText(getCompanyLegalDocumentStatusLabel(status))}
          />
        )
      },
      {
        title: 'File đính kèm',
        dataIndex: 'attachmentFilePath',
        key: 'attachmentFilePath',
        width: K_SIZE_120,
        align: 'center',
        render: (_: string, record: CompanyLegalDocument) =>
          record.attachmentFilePath ? (
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
        render: (_: unknown, record: CompanyLegalDocument) => (
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
          <TextBase classNames="title4" text="Danh sách văn bản pháp lý" />
          <ButtonBase
            type="primary"
            leftIcon="IC_ADD_OUTLINE2"
            customContent="Thêm văn bản"
            onClick={onOpenCreate}
            classNames="mobile:w-full mobile:justify-center"
          />
        </Flex>
        <Divider className="my-16" />

        <div className="mb-12 grid grid-cols-[minmax(200px,1.2fr)_minmax(180px,1fr)_minmax(160px,0.85fr)_minmax(160px,0.85fr)_auto] items-end gap-12 rounded-radius-l border border-color-300 bg-color-50 p-12 tablet:grid-cols-2 mobile:grid-cols-1">
          <AppTextField
            name="documentName"
            label="Tên văn bản"
            placeholder="Nhập tên văn bản"
            value={filter.documentName}
            onChange={(event) => onChangeFilter('documentName', event.target.value)}
            onPressEnter={onApplyFilter}
          />
          <AppTextField
            name="documentNumber"
            label="Số/Ký hiệu"
            placeholder="Nhập số, ký hiệu văn bản"
            value={filter.documentNumber}
            onChange={(event) => onChangeFilter('documentNumber', event.target.value)}
            onPressEnter={onApplyFilter}
          />
          <AppSelect
            name="documentType"
            label="Loại văn bản"
            value={filter.documentType}
            placeholder="-- Tất cả --"
            options={COMPANY_LEGAL_DOCUMENT_TYPE_FILTER_OPTIONS}
            onSelectOption={({ key }) => onChangeFilter('documentType', String(key))}
          />
          <AppSelect
            name="status"
            label="Trạng thái"
            value={filter.status}
            placeholder="-- Tất cả --"
            options={COMPANY_LEGAL_DOCUMENT_STATUS_FILTER_OPTIONS}
            onSelectOption={({ key }) => onChangeFilter('status', String(key))}
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

        <Spin spinning={listLoading && companyLegalDocumentList.length > K_SIZE_0}>
          <div className="overflow-hidden rounded-radius-l border border-color-400 duration-500">
            <AppTable
              loading={listLoading}
              rootClassName="w-full"
              className="[&_.ant-pagination]:hidden"
              scroll={{ x: 'max-content', y: '75vh' }}
              dataSource={companyLegalDocumentList}
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

export default CompanyLegalDocumentScreen;
