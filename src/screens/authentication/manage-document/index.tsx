'use client';

import {
  K_SIZE_0,
  K_SIZE_1,
  K_SIZE_100,
  K_SIZE_16,
  K_SIZE_160,
  K_SIZE_18,
  K_SIZE_200,
  K_SIZE_24,
  K_SIZE_8,
  NULL_VALUE,
  REQUIRED_MARK
} from '@constant';
import { Divider, Drawer, Flex, Spin, Upload } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import ButtonBase from 'components/button';
import IconHover from 'components/icon-vec-local/icon-hover';
import { AppSelectControl } from 'components/select';
import Status, { KIND_STATUS, TYPE_STATUS } from 'components/status';
import AppTable from 'components/table';
import AppPagination from 'components/table/pagination';
import TagFilter from 'components/tag-filter';
import { TextBase } from 'components/text';
import { AppTextField, AppTextFieldControl } from 'components/text-field';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import { ROUTES } from 'config/routes';
import PageWithBreadcrumb from 'layout/AppLayout/PageWithBreadcumb';
import { DOCUMENT_OWNER_TYPE, DOCUMENT_STATUS, DOCUMENT_TYPE, DocumentItem } from 'model/document';
import { useMemo } from 'react';
import { displayDateTimeFromServer } from 'utils/date';
import { useResponsive } from 'utils/responsive';
import {
  getUploadFileSizeError,
  MAX_UPLOAD_FILE_SIZE,
  MAX_UPLOAD_FILE_SIZE_TEXT
} from 'utils/upload';
import DocumentFilterDrawer, { type DocumentFilterForm } from './components/DocumentFilterDrawer';
import useManageDocument from './useManageDocument';

const DOCUMENT_STATUS_LABEL_MAP: Record<string, string> = {
  [DOCUMENT_STATUS.HOP_LE]: 'Hợp lệ',
  [DOCUMENT_STATUS.CAN_BO_SUNG]: 'Cần bổ sung',
  [DOCUMENT_STATUS.HET_HAN]: 'Hết hạn'
};

const DOCUMENT_STATUS_TYPE_MAP: Record<string, TYPE_STATUS> = {
  [DOCUMENT_STATUS.HOP_LE]: TYPE_STATUS.SUCCESS,
  [DOCUMENT_STATUS.CAN_BO_SUNG]: TYPE_STATUS.PENDING,
  [DOCUMENT_STATUS.HET_HAN]: TYPE_STATUS.ERROR
};

const DOCUMENT_STATUS_OPTIONS = [
  { value: DOCUMENT_STATUS.HOP_LE, label: 'Hợp lệ' },
  { value: DOCUMENT_STATUS.CAN_BO_SUNG, label: 'Cần bổ sung' },
  { value: DOCUMENT_STATUS.HET_HAN, label: 'Hết hạn' }
];

const DOCUMENT_TYPE_OPTIONS = [
  { value: DOCUMENT_TYPE.CMND_CCCD, label: 'CMND/CCCD' },
  { value: DOCUMENT_TYPE.DKKD, label: 'ĐKKD' },
  { value: DOCUMENT_TYPE.HD, label: 'HĐ' },
  { value: DOCUMENT_TYPE.SO_DO_DIEN, label: 'Sơ đồ điện' },
  { value: DOCUMENT_TYPE.KHAC, label: 'Khác' }
];

const DOCUMENT_TYPE_LABEL_MAP = Object.fromEntries(
  DOCUMENT_TYPE_OPTIONS.map((option) => [option.value, option.label])
);

const OWNER_TYPE_OPTIONS = [
  { value: DOCUMENT_OWNER_TYPE.CUSTOMER, label: 'Khách hàng' },
  { value: DOCUMENT_OWNER_TYPE.CONTRACT, label: 'Hợp đồng mua bán điện' },
  { value: DOCUMENT_OWNER_TYPE.OPERATION_CONTRACT, label: 'Hợp đồng vận hành' }
];

const OWNER_TYPE_LABEL_MAP = Object.fromEntries(
  OWNER_TYPE_OPTIONS.map((option) => [option.value, option.label])
);

const DOCUMENT_FILTER_LABEL_MAP: Record<keyof DocumentFilterForm, string> = {
  keyword: 'Từ khóa',
  ownerType: 'Loại chủ sở hữu',
  ownerId: 'Chủ sở hữu',
  docType: 'Loại tài liệu',
  status: 'Trạng thái',
  operationUnitId: 'Đơn vị vận hành'
};

const MAX_DOCUMENT_FILE_SIZE = MAX_UPLOAD_FILE_SIZE;

const formatFileSize = (sizeKb?: number) => {
  if (sizeKb === undefined || sizeKb === null) return NULL_VALUE;
  if (sizeKb < 1024) return `${sizeKb} KB`;
  return `${(sizeKb / 1024).toFixed(2)} MB`;
};

const getStatusLabel = (status?: string) => {
  if (!status) return NULL_VALUE;
  return DOCUMENT_STATUS_LABEL_MAP[status] || status;
};

const ManageDocumentScreen = () => {
  const { isMobile, isTablet } = useResponsive();
  const {
    t,
    documentList,
    total,
    listLoading,
    detailLoading,
    currentPage,
    pagination,
    defaultFilter,
    filterApplied,
    filterDrawerRef,
    onApplyFilter,
    onResetFilter,
    openAttach,
    setOpenAttach,
    openUpdate,
    selectedFile,
    setSelectedFile,
    selectedDocument,
    attachForm,
    updateForm,
    selectedAttachOwnerType,
    ownerOptions,
    onOpenOwnerDropdown,
    ownerDropdownRender,
    operationUnitOptions,
    getOperationUnitDisplay,
    onOpenOperationUnitDropdown,
    operationUnitDropdownRender,
    handleAttachSubmit,
    handleUpdateSubmit,
    onCloseAttach,
    onOpenUpdate,
    onCloseUpdate,
    onDelete,
    onView,
    onDownload
  } = useManageDocument();

  const {
    control: attachControl,
    handleSubmit: handleAttachFormSubmit,
    formState: { errors: attachErrors, isValid: isAttachValid }
  } = attachForm;

  const {
    control: updateControl,
    handleSubmit: handleUpdateFormSubmit,
    formState: { isValid: isUpdateValid, isDirty: isUpdateDirty }
  } = updateForm;

  const uploadFileList = useMemo<UploadFile[]>(() => {
    if (!selectedFile) return [];
    return [
      {
        uid: 'selected-document-file',
        name: selectedFile.name,
        status: 'done',
        size: selectedFile.size
      }
    ];
  }, [selectedFile]);

  const activeFilters = useMemo(
    () =>
      (Object.entries(filterApplied) as [keyof DocumentFilterForm, string][]).filter(([, value]) =>
        Boolean(value)
      ),
    [filterApplied]
  );

  const formatFilterValue = (key: keyof DocumentFilterForm, value: string) => {
    if (key === 'ownerType') return OWNER_TYPE_LABEL_MAP[value] || value;
    if (key === 'docType') return DOCUMENT_TYPE_LABEL_MAP[value] || value;
    if (key === 'status') return DOCUMENT_STATUS_LABEL_MAP[value] || value;
    if (key === 'operationUnitId') return getOperationUnitDisplay(value);
    return value;
  };

  const columns = useMemo<any[]>(
    () => [
      {
        title: 'Loại tài liệu',
        dataIndex: 'docType',
        key: 'docType',
        width: K_SIZE_160,
        render: (text: string) => DOCUMENT_TYPE_LABEL_MAP[text] || text || NULL_VALUE
      },
      {
        title: 'Tên file',
        dataIndex: 'originalFileName',
        key: 'originalFileName',
        width: K_SIZE_200,
        render: (text: string) => (
          <div title={text} className="max-w-[220px] truncate">
            {text || NULL_VALUE}
          </div>
        )
      },
      {
        title: 'Định dạng',
        dataIndex: 'format',
        key: 'format',
        width: K_SIZE_100,
        render: (text: string) => text?.toUpperCase?.() || NULL_VALUE
      },
      {
        title: 'Kích thước file',
        dataIndex: 'sizeKb',
        key: 'sizeKb',
        width: K_SIZE_160,
        render: (sizeKb: number) => formatFileSize(sizeKb)
      },
      {
        title: 'Ngày tải lên',
        dataIndex: 'uploadedAt',
        key: 'uploadedAt',
        width: K_SIZE_200,
        render: (text: string) => displayDateTimeFromServer(text)
      },
      {
        title: 'Trạng thái',
        dataIndex: 'status',
        key: 'status',
        width: K_SIZE_160,
        render: (status: string) => (
          <Status
            type={DOCUMENT_STATUS_TYPE_MAP[status] || TYPE_STATUS.DEFAULT}
            kind={KIND_STATUS.SECONDARY}
            content={getStatusLabel(status)}
          />
        )
      },
      {
        title: t('common:action'),
        fixed: 'right',
        align: 'center',
        width: K_SIZE_160,
        render: (_: unknown, record: DocumentItem) => (
          <div className="flex justify-center gap-8">
            <IconHover
              rootClassName="text-color-800"
              title="Xem tài liệu"
              icon="ICON_EYE_OPEN"
              iconHeight={K_SIZE_18}
              onClick={() => onView(record)}
            />
            <IconHover
              rootClassName="text-color-800"
              title="Tải tài liệu"
              icon="IC_DOWNLOAD_OUTLINE"
              iconHeight={K_SIZE_18}
              onClick={() => onDownload(record)}
            />
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
    [onDelete, onDownload, onOpenUpdate, onView, t]
  );

  const breadcrumbList = [
    {
      title: 'Hợp đồng'
    },
    {
      title: 'Quản lý hồ sơ giấy tờ',
      key: ROUTES.MANAGE_DOCUMENT
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
          <TextBase classNames="title4" text="Quản lý hồ sơ giấy tờ" />
          <Flex
            flex={K_SIZE_1}
            justify="end"
            gap={K_SIZE_16}
            className="mobile:mt-8 mobile:w-full mobile:flex-col"
          >
            <ButtonBase
              type="ghost"
              leftIcon="IC_FILTER_OUTLINE"
              customContent={t('common:advanced_filter')}
              onClick={() => filterDrawerRef.current?.open(filterApplied)}
              classNames="mobile:flex-1 mobile:justify-center"
            />
            <ButtonBase
              type="ghost"
              leftIcon="IC_ADD_OUTLINE2"
              customContent="Đính kèm tài liệu"
              onClick={() => setOpenAttach(true)}
              classNames="mobile:flex-1 mobile:justify-center"
            />
          </Flex>
        </Flex>
        <Divider className="my-16" />

        {activeFilters.length > K_SIZE_0 && (
          <div className="mb-8 flex w-full flex-wrap items-center gap-8">
            {activeFilters.map(([key, value]) => (
              <TagFilter
                key={key}
                content={`${DOCUMENT_FILTER_LABEL_MAP[key]}: ${formatFilterValue(key, value)}`}
                onClose={() => onResetFilter(key)}
              />
            ))}
          </div>
        )}

        <Spin spinning={listLoading && documentList.length > K_SIZE_0}>
          <div className="overflow-hidden rounded-radius-l border border-color-400 duration-500">
            <AppTable
              loading={listLoading}
              rootClassName="w-full"
              className="[&_.ant-pagination]:hidden"
              scroll={{ x: 'max-content', y: '75vh' }}
              dataSource={documentList}
              columns={columns}
              rowKey="id"
              pagination={pagination}
            />
          </div>
          <AppPagination currentPage={currentPage} total={total} pagination={pagination} />
        </Spin>

        <form id="attach-document-form" onSubmit={handleAttachFormSubmit(handleAttachSubmit)}>
          <Drawer
            open={openAttach}
            title={
              <Flex justify="space-between" align="center">
                <div>Đính kèm tài liệu</div>
                <IconHover title="" icon="IC_CLOSE_OUTLINE" onClick={onCloseAttach} />
              </Flex>
            }
            destroyOnClose
            placement="right"
            closable={false}
            onClose={onCloseAttach}
            width={isTablet || isMobile ? '80vw' : '40vw'}
            footer={
              <Flex justify="end" gap={K_SIZE_8}>
                <ButtonBase
                  classNames="app-common-btn"
                  type="ghost"
                  customContent={t('common:close')}
                  onClick={onCloseAttach}
                />
                <ButtonBase
                  classNames="app-common-btn"
                  type="primary"
                  form="attach-document-form"
                  htmlType="submit"
                  disabled={
                    !isAttachValid ||
                    !selectedFile ||
                    Boolean(attachErrors.docType) ||
                    detailLoading
                  }
                  customContent={
                    <div className="flex flex-row items-center justify-center">
                      <div>{t('common:confirm')}</div>
                      {detailLoading && (
                        <div className="ml-8">
                          <Spin size="small" />
                        </div>
                      )}
                    </div>
                  }
                />
              </Flex>
            }
          >
            <div className="grid gap-12">
              <AppSelectControl
                name="ownerType"
                label="Loại chủ sở hữu"
                labelSuffix={<span className="text-error-600">{REQUIRED_MARK}</span>}
                placeholder="Chọn loại chủ sở hữu"
                options={OWNER_TYPE_OPTIONS}
                control={attachControl}
              />
              <AppSelectControl
                name="ownerId"
                label="Chủ sở hữu"
                labelSuffix={<span className="text-error-600">{REQUIRED_MARK}</span>}
                placeholder="Chọn chủ sở hữu"
                options={ownerOptions}
                disabled={!selectedAttachOwnerType}
                dropdownRender={ownerDropdownRender}
                onOpenChange={onOpenOwnerDropdown}
                onChange={(ownerId) =>
                  attachForm.setValue('ownerId', String(ownerId || ''), {
                    shouldDirty: true,
                    shouldTouch: true,
                    shouldValidate: true
                  })
                }
                control={attachControl}
              />
              <AppSelectControl
                name="docType"
                label="Loại tài liệu"
                labelSuffix={<span className="text-error-600">{REQUIRED_MARK}</span>}
                placeholder="Chọn loại tài liệu"
                options={DOCUMENT_TYPE_OPTIONS}
                control={attachControl}
              />
              <AppSelectControl
                name="status"
                label="Trạng thái"
                placeholder="Chọn trạng thái"
                options={DOCUMENT_STATUS_OPTIONS}
                control={attachControl}
              />
              <AppTextFieldControl
                name="note"
                label={t('common:note')}
                placeholder={t('common:input_pla', { label: t('common:note').toLowerCase() })}
                control={attachControl}
              />
              <div>
                <label className="mb-4 inline-flex flex-row items-center text-14 font-semibold leading-24 text-color-900">
                  Tài liệu
                  <span className="ml-4 text-error-600">{REQUIRED_MARK}</span>
                </label>
                <Upload
                  maxCount={1}
                  fileList={uploadFileList}
                  beforeUpload={(file) => {
                    if (file.size > MAX_DOCUMENT_FILE_SIZE) {
                      showToast({
                        type: TYPE_TOAST.ERROR,
                        content: getUploadFileSizeError('tài liệu')
                      });
                      return Upload.LIST_IGNORE;
                    }

                    setSelectedFile(file);
                    return false;
                  }}
                  onRemove={() => {
                    setSelectedFile(undefined);
                    return true;
                  }}
                >
                  <ButtonBase
                    type="secondary"
                    leftIcon="IC_UPLOAD_OUTLINE"
                    customContent={selectedFile ? 'Đổi tài liệu' : 'Chọn tài liệu'}
                    heightIcon={K_SIZE_24}
                    widthIcon={K_SIZE_24}
                  />
                </Upload>
                <TextBase
                  text={`Tối đa ${MAX_UPLOAD_FILE_SIZE_TEXT}.`}
                  classNames="caption1 mt-4 !text-color-700"
                />
              </div>
            </div>
          </Drawer>
        </form>

        <form id="update-document-form" onSubmit={handleUpdateFormSubmit(handleUpdateSubmit)}>
          <Drawer
            open={openUpdate}
            title={
              <Flex justify="space-between" align="center">
                <div>Cập nhật tài liệu</div>
                <IconHover title="" icon="IC_CLOSE_OUTLINE" onClick={onCloseUpdate} />
              </Flex>
            }
            destroyOnClose
            placement="right"
            closable={false}
            onClose={onCloseUpdate}
            width={isTablet || isMobile ? '80vw' : '40vw'}
            footer={
              <Flex justify="end" gap={K_SIZE_8}>
                <ButtonBase
                  classNames="app-common-btn"
                  type="ghost"
                  customContent={t('common:close')}
                  onClick={onCloseUpdate}
                />
                <ButtonBase
                  classNames="app-common-btn"
                  type="primary"
                  form="update-document-form"
                  htmlType="submit"
                  disabled={!isUpdateValid || !isUpdateDirty || detailLoading}
                  customContent={
                    <div className="flex flex-row items-center justify-center">
                      <div>{t('common:confirm')}</div>
                      {detailLoading && (
                        <div className="ml-8">
                          <Spin size="small" />
                        </div>
                      )}
                    </div>
                  }
                />
              </Flex>
            }
          >
            <div className="grid gap-12">
              <AppTextField
                name="originalFileName"
                label="Tên file"
                value={selectedDocument?.originalFileName || ''}
                isView
              />
              <AppSelectControl
                name="status"
                label="Trạng thái"
                placeholder="Chọn trạng thái"
                options={DOCUMENT_STATUS_OPTIONS}
                control={updateControl}
              />
              <AppTextFieldControl
                name="note"
                label={t('common:note')}
                placeholder={t('common:input_pla', { label: t('common:note').toLowerCase() })}
                control={updateControl}
              />
            </div>
          </Drawer>
        </form>

        <DocumentFilterDrawer
          ref={filterDrawerRef}
          defaultValues={defaultFilter}
          ownerTypeOptions={OWNER_TYPE_OPTIONS}
          documentTypeOptions={DOCUMENT_TYPE_OPTIONS}
          documentStatusOptions={DOCUMENT_STATUS_OPTIONS}
          operationUnitOptions={operationUnitOptions}
          operationUnitDropdownRender={operationUnitDropdownRender}
          onOpenOperationUnitDropdown={onOpenOperationUnitDropdown}
          onApplyFilter={onApplyFilter}
          onResetFilter={onResetFilter}
        />
      </section>
    </PageWithBreadcrumb>
  );
};

export default ManageDocumentScreen;
