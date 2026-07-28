'use client';

import { K_SIZE_1, K_SIZE_24, K_SIZE_8, REQUIRED_MARK } from '@constant';
import { Divider, Flex, Spin, Upload } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import clsx from 'clsx';
import ButtonBase from 'components/button';
import { AppDatePickerControl } from 'components/date-picker';
import { IconSvgLocal } from 'components/icon-vec-local';
import { AppSelectControl } from 'components/select';
import CustomDropSearchMore from 'components/select/CustomDropSearchMore';
import { AppTakeNoteControl } from 'components/take-note';
import { TextBase } from 'components/text';
import { AppTextField, AppTextFieldControl } from 'components/text-field';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import PageWithBreadcrumb from 'layout/AppLayout/PageWithBreadcumb';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { getUploadFileSizeError, MAX_UPLOAD_FILE_SIZE_TEXT } from 'utils/upload';
import useCompanyLegalDocumentForm from '../hooks/useCompanyLegalDocumentForm';
import {
  ACCEPTED_ATTACHMENT_TEXT,
  COMPANY_LEGAL_DOCUMENT_STATUS_OPTIONS,
  COMPANY_LEGAL_DOCUMENT_TYPE_OPTIONS,
  isAcceptedAttachmentFile,
  MAX_ATTACHMENT_FILE_SIZE
} from '../utils';

const requiredMark = <span className="text-error-600">{REQUIRED_MARK}</span>;

interface CompanyLegalDocumentFormScreenProps {
  isEditMode: boolean;
}

const CompanyLegalDocumentFormScreen = ({ isEditMode }: CompanyLegalDocumentFormScreenProps) => {
  const {
    dateApiFormat,
    form,
    detailLoading,
    selectedDocument,
    selectedFile,
    submitLocked,
    employeeOptions,
    employeeSearch,
    employeeOptionsLoading,
    setSelectedFile,
    onSearchEmployees,
    onOpenEmployeeDropdown,
    onBack,
    onSubmit,
    onDeleteAttachment,
    onViewAttachment,
    onDownloadAttachment
  } = useCompanyLegalDocumentForm({ isEditMode });

  const {
    control,
    handleSubmit,
    formState: { isDirty, isValid }
  } = form;

  const renderEmployeeDropdown = (menuInstance: ReactNode) => (
    <CustomDropSearchMore
      menuInstance={menuInstance}
      searchValue={employeeSearch}
      onChangeSearch={onSearchEmployees}
      onMore={() => {}}
      totalList={employeeOptions.length}
      total={employeeOptions.length}
      loading={employeeOptionsLoading}
    />
  );

  const uploadFileList = useMemo<UploadFile[]>(() => {
    if (!selectedFile) return [];
    return [
      {
        uid: 'selected-company-legal-document-file',
        name: selectedFile.name,
        status: 'done',
        size: selectedFile.size
      }
    ];
  }, [selectedFile]);

  const title = isEditMode ? 'Cập nhật văn bản pháp lý' : 'Thêm mới văn bản pháp lý';
  return (
    <PageWithBreadcrumb>
      <div className={clsx('pb-24', { 'mb-[76px]': true })}>
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
            <TextBase classNames="title4" text={title} />
          </div>
        </Flex>
        <Divider className="my-16" />

        <Spin spinning={detailLoading && isEditMode}>
          <div className="grid grid-cols-[minmax(0,1.25fr)_minmax(360px,0.9fr)] gap-16 tablet:grid-cols-1">
            <section className="rounded-radius-l border border-color-300 bg-color-50 p-16">
              <TextBase
                classNames="sub-title3 mb-16 !text-primary-700"
                text="1. THÔNG TIN VĂN BẢN"
              />
              <div className="grid grid-cols-3 gap-12 mobile:grid-cols-1">
                <AppSelectControl
                  name="documentType"
                  label="Loại văn bản"
                  labelSuffix={requiredMark}
                  placeholder="Chọn loại văn bản"
                  options={COMPANY_LEGAL_DOCUMENT_TYPE_OPTIONS}
                  control={control}
                />
                <AppTextField
                  name="documentId"
                  label="Mã văn bản"
                  value={selectedDocument?.id ? String(selectedDocument.id) : 'Tự động sinh'}
                  disabled
                />
                <AppTextFieldControl
                  name="documentNumber"
                  label="Số/Ký hiệu văn bản"
                  placeholder="Nhập số, ký hiệu văn bản"
                  control={control}
                />
                <div className="col-span-3 mobile:col-span-1">
                  <AppTextFieldControl
                    name="documentName"
                    label="Tên văn bản"
                    labelSuffix={requiredMark}
                    placeholder="Nhập tên văn bản"
                    control={control}
                  />
                </div>
                <AppDatePickerControl
                  name="documentDate"
                  label="Ngày văn bản"
                  placeholder="Chọn ngày văn bản"
                  control={control}
                  backendFormat={dateApiFormat}
                  allowClear
                  wrapperClassName="w-full"
                  datePickerClassName="w-full"
                />
                <AppDatePickerControl
                  name="effectiveDate"
                  label="Ngày hiệu lực"
                  placeholder="Chọn ngày hiệu lực"
                  control={control}
                  backendFormat={dateApiFormat}
                  allowClear
                  wrapperClassName="w-full"
                  datePickerClassName="w-full"
                />
                <AppDatePickerControl
                  name="expiryDate"
                  label="Ngày hết hiệu lực"
                  placeholder="Chọn ngày hết hiệu lực"
                  control={control}
                  backendFormat={dateApiFormat}
                  allowClear
                  wrapperClassName="w-full"
                  datePickerClassName="w-full"
                />
                <div className="col-span-3 mobile:col-span-1">
                  <AppTakeNoteControl
                    name="summary"
                    label="Nội dung trích yếu"
                    placeholder="Nhập nội dung trích yếu của văn bản"
                    control={control}
                  />
                </div>
                <AppSelectControl
                  name="draftedBy"
                  label="Người soạn thảo"
                  placeholder="Chọn người soạn thảo"
                  options={employeeOptions}
                  dropdownRender={renderEmployeeDropdown}
                  onOpenChange={(open) => {
                    if (open) onOpenEmployeeDropdown();
                  }}
                  unSeleted
                  control={control}
                />
                <AppSelectControl
                  name="approvedBy"
                  label="Người ký duyệt"
                  placeholder="Chọn người ký duyệt"
                  options={employeeOptions}
                  dropdownRender={renderEmployeeDropdown}
                  onOpenChange={(open) => {
                    if (open) onOpenEmployeeDropdown();
                  }}
                  unSeleted
                  control={control}
                />
                <AppSelectControl
                  name="status"
                  label="Trạng thái"
                  labelSuffix={requiredMark}
                  placeholder="Chọn trạng thái"
                  options={COMPANY_LEGAL_DOCUMENT_STATUS_OPTIONS}
                  control={control}
                />
              </div>
            </section>

            <div className="grid content-start gap-16">
              <section className="rounded-radius-l border border-color-300 bg-color-50 p-16">
                <TextBase classNames="sub-title3 mb-16 !text-primary-700" text="2. FILE ĐÍNH KÈM" />
                <Upload.Dragger
                  className="block overflow-hidden [&_.ant-upload-btn]:!p-0 [&_.ant-upload-drag-container]:!align-middle"
                  height={132}
                  maxCount={K_SIZE_1}
                  fileList={uploadFileList}
                  showUploadList={false}
                  beforeUpload={(file) => {
                    if (!isAcceptedAttachmentFile(file)) {
                      showToast({
                        type: TYPE_TOAST.ERROR,
                        content: `File đính kèm chỉ hỗ trợ ${ACCEPTED_ATTACHMENT_TEXT}`
                      });
                      return Upload.LIST_IGNORE;
                    }

                    if (file.size > MAX_ATTACHMENT_FILE_SIZE) {
                      showToast({
                        type: TYPE_TOAST.ERROR,
                        content: getUploadFileSizeError()
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
                  <div className="flex min-h-[104px] flex-col items-center justify-center gap-8 p-12 text-center">
                    <IconSvgLocal
                      name="IC_UPLOAD_OUTLINE"
                      height={K_SIZE_24}
                      width={K_SIZE_24}
                      classNames="text-primary-600"
                    />
                    <div className="flex flex-wrap items-center justify-center gap-8">
                      <TextBase text="Kéo thả file vào đây hoặc" classNames="caption1" />
                      <ButtonBase type="secondary" size={32} customContent="Chọn file" />
                    </div>
                    <TextBase
                      text={`Tối đa ${MAX_UPLOAD_FILE_SIZE_TEXT}/file`}
                      classNames="caption1 !text-color-700"
                    />
                  </div>
                </Upload.Dragger>

                <div className="mt-16">
                  {selectedFile ? (
                    <div className="flex items-center justify-between gap-12 rounded-radius-m border border-color-300 bg-color-50 px-12 py-[10px] text-12 text-color-800">
                      <div className="min-w-0 truncate font-medium" title={selectedFile.name}>
                        {selectedFile.name}
                      </div>
                      <ButtonBase
                        type="ghost"
                        size={32}
                        customContent="Gỡ"
                        onClick={() => setSelectedFile(undefined)}
                      />
                    </div>
                  ) : selectedDocument?.attachmentFilePath ? (
                    <div className="flex items-center justify-between gap-12 rounded-radius-m border border-color-300 bg-color-50 px-12 py-[10px] text-12 text-color-800">
                      <div
                        className="min-w-0 truncate font-medium"
                        title={selectedDocument.attachmentFilePath}
                      >
                        {selectedDocument.attachmentFilePath}
                      </div>
                      <Flex gap={K_SIZE_8}>
                        <IconSvgLocal
                          name="ICON_EYE_OPEN"
                          height={18}
                          classNames="cursor-pointer"
                          onClick={onViewAttachment}
                        />
                        <IconSvgLocal
                          name="IC_DOWNLOAD_OUTLINE"
                          height={18}
                          classNames="cursor-pointer"
                          onClick={onDownloadAttachment}
                        />
                        <IconSvgLocal
                          name="IC_TRASH_OUTLINE"
                          height={18}
                          classNames="cursor-pointer text-error-500"
                          onClick={onDeleteAttachment}
                        />
                      </Flex>
                    </div>
                  ) : (
                    <div className="rounded-radius-m border border-dashed border-color-300 px-12 py-16 text-center text-12 text-color-700">
                      Chưa có file nào
                    </div>
                  )}
                </div>
              </section>

              <section className="rounded-radius-l border border-color-300 bg-color-50 p-16">
                <TextBase classNames="sub-title3 mb-16 !text-primary-700" text="3. GHI CHÚ" />
                <AppTakeNoteControl
                  name="note"
                  placeholder="Nhập ghi chú"
                  control={control}
                  autoSize={{ minRows: 3, maxRows: 5 }}
                />
              </section>
            </div>
          </div>
        </Spin>

        <div className="fixed bottom-0 left-[254px] right-0 z-[9] bg-color-50 tablet:left-0">
          <div className="flex justify-end gap-16 px-24 py-16">
            <ButtonBase
              classNames="app-common-btn flex items-center justify-center mobile:flex-1"
              type="ghost"
              customContent="Hủy bỏ"
              onClick={onBack}
            />
            <ButtonBase
              classNames="app-common-btn flex items-center justify-center mobile:flex-1"
              type="primary"
              customContent={
                <div className="flex flex-row items-center justify-center">
                  <div>Lưu</div>
                  {detailLoading && (
                    <div className="ml-8">
                      <Spin size="small" />
                    </div>
                  )}
                </div>
              }
              disabled={
                submitLocked ||
                !isValid ||
                detailLoading ||
                (isEditMode && !isDirty && !selectedFile)
              }
              onClick={handleSubmit(onSubmit)}
            />
          </div>
        </div>
      </div>
    </PageWithBreadcrumb>
  );
};

export default CompanyLegalDocumentFormScreen;
