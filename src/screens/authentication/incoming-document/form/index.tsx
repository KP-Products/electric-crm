'use client';

import { K_SIZE_1, K_SIZE_24, K_SIZE_8, NULL_VALUE, REQUIRED_MARK } from '@constant';
import { Divider, Flex, Spin, Upload } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import clsx from 'clsx';
import ButtonBase from 'components/button';
import { AppDatePickerControl } from 'components/date-picker';
import { IconSvgLocal } from 'components/icon-vec-local';
import { AppSelectControl } from 'components/select';
import { AppTakeNoteControl } from 'components/take-note';
import { TextBase } from 'components/text';
import { AppTextField, AppTextFieldControl } from 'components/text-field';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import PageWithBreadcrumb from 'layout/AppLayout/PageWithBreadcumb';
import { useMemo } from 'react';
import { displayDateTimeFromServer } from 'utils/date';
import { getUploadFileSizeError, MAX_UPLOAD_FILE_SIZE_TEXT } from 'utils/upload';
import useIncomingDocumentForm from '../hooks/useIncomingDocumentForm';
import {
  CONFIDENTIALITY_LEVEL_OPTIONS,
  INCOMING_DOCUMENT_TYPE_OPTIONS,
  MAX_ATTACHMENT_FILE_SIZE,
  URGENCY_LEVEL_OPTIONS
} from '../utils';

const requiredMark = <span className="text-error-600">{REQUIRED_MARK}</span>;

const formatFileSize = (size?: number) => {
  if (!size) return NULL_VALUE;
  const sizeKb = size / 1024;
  if (sizeKb < 1024) return `${sizeKb.toFixed(0)} KB`;
  return `${(sizeKb / 1024).toFixed(2)} MB`;
};

interface IncomingDocumentFormScreenProps {
  isEditMode: boolean;
}

const IncomingDocumentFormScreen = ({ isEditMode }: IncomingDocumentFormScreenProps) => {
  const {
    dateApiFormat,
    form,
    detailLoading,
    selectedDocument,
    selectedFile,
    setSelectedFile,
    submitLocked,
    createdByDisplay,
    approverOptions,
    onOpenApproverDropdown,
    renderApproverDropdown,
    onBack,
    onSubmit,
    onDeleteAttachment,
    onViewAttachment,
    onDownloadAttachment
  } = useIncomingDocumentForm({ isEditMode });

  const {
    control,
    handleSubmit,
    formState: { isDirty, isValid }
  } = form;

  const uploadFileList = useMemo<UploadFile[]>(() => {
    if (!selectedFile) return [];
    return [
      {
        uid: 'selected-incoming-document-file',
        name: selectedFile.name,
        status: 'done',
        size: selectedFile.size
      }
    ];
  }, [selectedFile]);

  const urgencyLevelOptions = useMemo(
    () => URGENCY_LEVEL_OPTIONS.filter((option) => option.value !== ''),
    []
  );
  const confidentialityLevelOptions = useMemo(
    () => CONFIDENTIALITY_LEVEL_OPTIONS.filter((option) => option.value !== ''),
    []
  );

  const title = isEditMode ? 'Cập nhật văn bản đến' : 'Thêm văn bản đến';
  const createdAtDisplay = selectedDocument?.createdAt
    ? displayDateTimeFromServer(selectedDocument.createdAt)
    : 'Tự động';

  return (
    <PageWithBreadcrumb
      breadcrumbList={[{ title: 'Văn bản pháp lý' }, { title: 'Văn bản đến' }, { title }]}
    >
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
          <div className="grid grid-cols-[minmax(0,1.25fr)_minmax(380px,0.9fr)] gap-16 tablet:grid-cols-1">
            <section className="rounded-radius-l border border-color-300 bg-color-50 p-16">
              <TextBase
                classNames="sub-title3 mb-16 !text-primary-700"
                text="1. THÔNG TIN VĂN BẢN"
              />
              <div className="grid grid-cols-2 gap-12 mobile:grid-cols-1">
                <AppTextFieldControl
                  name="incomingNumber"
                  label="Số đến"
                  labelSuffix={requiredMark}
                  placeholder="Nhập số đến"
                  control={control}
                />
                <AppDatePickerControl
                  name="incomingDate"
                  label="Ngày đến"
                  placeholder="Chọn ngày đến"
                  control={control}
                  backendFormat={dateApiFormat}
                  allowClear
                  wrapperClassName="w-full"
                  datePickerClassName="w-full"
                />
                <AppTextFieldControl
                  name="documentNumber"
                  label="Số/Ký hiệu văn bản"
                  placeholder="Nhập số/ký hiệu văn bản"
                  control={control}
                />
                <AppDatePickerControl
                  name="documentDate"
                  label="Ngày văn bản"
                  labelSuffix={requiredMark}
                  placeholder="Chọn ngày văn bản"
                  control={control}
                  backendFormat={dateApiFormat}
                  allowClear
                  wrapperClassName="w-full"
                  datePickerClassName="w-full"
                />
                <AppTextFieldControl
                  name="issuingAgency"
                  label="Cơ quan ban hành"
                  labelSuffix={requiredMark}
                  placeholder="Nhập cơ quan ban hành"
                  control={control}
                />
                <AppSelectControl
                  name="documentType"
                  label="Loại văn bản"
                  placeholder="Chọn loại văn bản"
                  options={INCOMING_DOCUMENT_TYPE_OPTIONS}
                  control={control}
                />
                <div className="col-span-2 mobile:col-span-1">
                  <AppTakeNoteControl
                    name="summary"
                    label="Trích yếu nội dung"
                    labelSuffix={requiredMark}
                    placeholder="Nhập trích yếu nội dung văn bản"
                    control={control}
                    autoSize={{ minRows: 3, maxRows: 5 }}
                  />
                </div>
                <AppSelectControl
                  name="urgencyLevel"
                  label="Độ khẩn"
                  options={urgencyLevelOptions}
                  placeholder="Chọn độ khẩn"
                  control={control}
                />
                <AppSelectControl
                  name="confidentialityLevel"
                  label="Độ mật"
                  options={confidentialityLevelOptions}
                  placeholder="Chọn độ mật"
                  control={control}
                />
                <AppTextFieldControl
                  name="pageCount"
                  label="Số trang"
                  placeholder="Nhập số trang"
                  control={control}
                  inputMode="numeric"
                  formatNumberWithCommas
                />
                <AppDatePickerControl
                  name="dueDate"
                  label="Hạn xử lý"
                  placeholder="Chọn hạn xử lý"
                  control={control}
                  backendFormat={dateApiFormat}
                  allowClear
                  wrapperClassName="w-full"
                  datePickerClassName="w-full"
                />
                <div className="col-span-2 mobile:col-span-1">
                  <AppTakeNoteControl
                    name="note"
                    label="Ghi chú"
                    placeholder="Nhập ghi chú"
                    control={control}
                    autoSize={{ minRows: 3, maxRows: 5 }}
                  />
                </div>
              </div>
            </section>

            <div className="grid content-start gap-16">
              <section className="rounded-radius-l border border-color-300 bg-color-50 p-16">
                <TextBase classNames="sub-title3 mb-16 !text-primary-700" text="2. FILE VĂN BẢN" />
                <Upload.Dragger
                  className="block w-full overflow-hidden [&_.ant-upload-btn]:!p-0 [&_.ant-upload-drag-container]:!align-middle"
                  height={132}
                  maxCount={K_SIZE_1}
                  fileList={uploadFileList}
                  showUploadList={false}
                  beforeUpload={(file) => {
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
                  <div className="flex min-h-[104px] w-full flex-col items-center justify-center gap-8 p-12 text-center">
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

                <div className="mt-16 overflow-hidden rounded-radius-m border border-color-300">
                  <div className="grid grid-cols-[48px_minmax(0,1fr)_96px_110px] bg-color-100 px-12 py-8 text-12 font-semibold text-color-800">
                    <div>STT</div>
                    <div>Tên file</div>
                    <div>Dung lượng</div>
                    <div>Thao tác</div>
                  </div>
                  {selectedFile ? (
                    <div className="grid grid-cols-[48px_minmax(0,1fr)_96px_110px] items-center px-12 py-[10px] text-12 text-color-800">
                      <div>{K_SIZE_1}</div>
                      <div className="truncate" title={selectedFile.name}>
                        {selectedFile.name}
                      </div>
                      <div>{formatFileSize(selectedFile.size)}</div>
                      <ButtonBase
                        type="ghost"
                        size={32}
                        customContent="Gỡ"
                        onClick={() => setSelectedFile(undefined)}
                      />
                    </div>
                  ) : selectedDocument?.filePath ? (
                    <div className="grid grid-cols-[48px_minmax(0,1fr)_96px_110px] items-center px-12 py-[10px] text-12 text-color-800">
                      <div>{K_SIZE_1}</div>
                      <div className="truncate" title={selectedDocument.filePath}>
                        {selectedDocument.filePath}
                      </div>
                      <div>{NULL_VALUE}</div>
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
                    <div className="px-12 py-16 text-center text-12 text-color-700">
                      Chưa có file nào
                    </div>
                  )}
                </div>
              </section>

              <section className="rounded-radius-l border border-color-300 bg-color-50 p-16">
                <TextBase
                  classNames="sub-title3 mb-16 !text-primary-700"
                  text="3. THÔNG TIN XỬ LÝ"
                />
                <div className="grid grid-cols-2 gap-12 mobile:grid-cols-1">
                  <AppTextField
                    name="createdBy"
                    label="Người tạo"
                    value={createdByDisplay || 'Tự động'}
                    disabled
                  />
                  <AppTextField
                    name="createdAt"
                    label="Ngày tạo"
                    value={createdAtDisplay}
                    disabled
                  />
                  <AppSelectControl
                    name="approvedBy"
                    label="Người duyệt"
                    placeholder="Chọn người duyệt"
                    options={approverOptions}
                    dropdownRender={renderApproverDropdown}
                    onOpenChange={(open) => {
                      if (open) onOpenApproverDropdown();
                    }}
                    suffix={<IconSvgLocal name="ICON_SEARCH" height={20} width={20} />}
                    unSeleted
                    control={control}
                  />
                  <AppDatePickerControl
                    name="approvalDate"
                    label="Ngày duyệt"
                    placeholder="Chọn ngày duyệt"
                    control={control}
                    backendFormat={dateApiFormat}
                    allowClear
                    wrapperClassName="w-full"
                    datePickerClassName="w-full"
                  />
                  <div className="col-span-2 mobile:col-span-1">
                    <AppTakeNoteControl
                      name="approvalNote"
                      label="Ý kiến duyệt"
                      placeholder="Nhập ý kiến duyệt"
                      control={control}
                      autoSize={{ minRows: 3, maxRows: 5 }}
                    />
                  </div>
                </div>
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

export default IncomingDocumentFormScreen;
