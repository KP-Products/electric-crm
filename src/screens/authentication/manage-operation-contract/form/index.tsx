'use client';

import { K_SIZE_24, K_SIZE_8, REQUIRED_MARK } from '@constant';
import { Divider, Flex, Spin, Upload } from 'antd';
import { CloudUploadOutlined } from '@ant-design/icons';
import { useSearchParams } from 'next/navigation';
import clsx from 'clsx';
import { formatIntegerWithCommas } from 'utils/number-input';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import ButtonBase from 'components/button';
import { AppDatePickerControl } from 'components/date-picker';
import { IconSvgLocal } from 'components/icon-vec-local';
import { AppSelectControl } from 'components/select';
import { AppTakeNoteControl } from 'components/take-note';
import { TextBase } from 'components/text';
import { AppTextFieldControl } from 'components/text-field';
import PageWithBreadcrumb from 'layout/AppLayout/PageWithBreadcumb';
import { OPERATION_CONTRACT_STATUS_OPTIONS, OPERATION_CONTRACT_DEFAULT_TYPE } from '../utils';
import useOperationContractForm from '../hooks/useOperationContractForm';

const requiredMark = <span className="text-error-600">{REQUIRED_MARK}</span>;

interface ManageOperationContractFormProps {
  isEditMode: boolean;
}

const OperationContractFormContent = ({ isEditMode }: ManageOperationContractFormProps) => {
  const {
    dateApiFormat,
    form,
    detailLoading,
    savedId,
    files,
    addFile,
    removeFile,
    customerOptions,
    onOpenCustomerDropdown,
    customerDropdownRender,
    onBack,
    onSubmit
  } = useOperationContractForm({ isEditMode });

  const {
    control,
    handleSubmit,
    formState: { isDirty, isValid }
  } = form;

  const title = isEditMode ? 'Cập nhật hợp đồng vận hành' : 'Thêm mới hợp đồng vận hành';

  const renderActions = () => (
    <Flex justify="end" gap={K_SIZE_8}>
      <ButtonBase
        type="ghost"
        customContent="Hủy"
        onClick={onBack}
        classNames="app-common-btn"
        disabled={detailLoading}
      />
      <ButtonBase
        type="primary"
        customContent={
          <div className="flex items-center justify-center">
            <div>Lưu</div>
            {detailLoading && (
              <div className="ml-8">
                <Spin size="small" />
              </div>
            )}
          </div>
        }
        form="operation-contract-form"
        htmlType="submit"
        classNames="app-common-btn"
        disabled={!isValid || Boolean(isEditMode && !isDirty && !files.length) || detailLoading}
      />
    </Flex>
  );

  return (
    <PageWithBreadcrumb
      breadcrumbList={[{ title: 'Hợp đồng' }, { title: 'Quản lý hợp đồng vận hành' }, { title }]}
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
          <form id="operation-contract-form" onSubmit={handleSubmit(onSubmit)}>
            <fieldset disabled={detailLoading || Boolean(!isEditMode && savedId)}>
              <section className="rounded-radius-l border border-color-300 bg-color-50 p-16">
                <TextBase
                  classNames="sub-title3 mb-16 !text-primary-700"
                  text="Thông tin hợp đồng"
                />
                <div className="grid grid-cols-4 gap-12 tablet:grid-cols-2 mobile:grid-cols-1">
                  <AppTextFieldControl
                    name="contractNumber"
                    label="Số hợp đồng"
                    labelSuffix={requiredMark}
                    placeholder="Nhập số hợp đồng"
                    control={control}
                    disabled={isEditMode}
                  />
                  <AppTextFieldControl
                    name="contractName"
                    label="Tên hợp đồng"
                    labelSuffix={requiredMark}
                    placeholder="Nhập tên hợp đồng"
                    control={control}
                  />
                  <AppSelectControl
                    name="customerId"
                    label="Khách hàng"
                    labelSuffix={requiredMark}
                    placeholder="Chọn khách hàng"
                    disabled={detailLoading || Boolean(!isEditMode && savedId)}
                    options={customerOptions}
                    dropdownRender={customerDropdownRender}
                    onOpenChange={onOpenCustomerDropdown}
                    control={control}
                  />
                  <AppSelectControl
                    name="status"
                    label="Trạng thái"
                    placeholder="Chọn trạng thái"
                    disabled={detailLoading || Boolean(!isEditMode && savedId)}
                    options={OPERATION_CONTRACT_STATUS_OPTIONS}
                    control={control}
                  />
                  <AppDatePickerControl
                    name="signedDate"
                    label="Ngày ký"
                    labelSuffix={REQUIRED_MARK}
                    labelSuffixClassName="text-error-600"
                    placeholder="Chọn ngày ký"
                    backendFormat={dateApiFormat}
                    wrapperClassName="w-full"
                    datePickerClassName="w-full"
                    control={control}
                  />
                  <AppDatePickerControl
                    name="effectiveDate"
                    label="Ngày hiệu lực"
                    labelSuffix={REQUIRED_MARK}
                    labelSuffixClassName="text-error-600"
                    placeholder="Chọn ngày hiệu lực"
                    backendFormat={dateApiFormat}
                    wrapperClassName="w-full"
                    datePickerClassName="w-full"
                    control={control}
                  />
                  <AppDatePickerControl
                    name="expiryDate"
                    label="Ngày hết hạn"
                    placeholder="Chọn ngày hết hạn"
                    backendFormat={dateApiFormat}
                    allowClear
                    wrapperClassName="w-full"
                    datePickerClassName="w-full"
                    control={control}
                  />
                  <AppSelectControl
                    options={Array.from(
                      new Set(
                        [OPERATION_CONTRACT_DEFAULT_TYPE, form.watch('contractType')].filter(
                          Boolean
                        )
                      )
                    ).map((value) => ({ value, label: value }))}
                    disabled={detailLoading || Boolean(!isEditMode && savedId)}
                    name="contractType"
                    label="Loại hợp đồng"
                    labelSuffix={requiredMark}
                    placeholder={OPERATION_CONTRACT_DEFAULT_TYPE}
                    control={control}
                  />
                  <AppTextFieldControl
                    name="contractValue"
                    label="Giá trị hợp đồng (VND)"
                    labelSuffix={requiredMark}
                    placeholder="Nhập giá trị hợp đồng"
                    control={control}
                    formatNumberWithCommas
                    onPaste={(event) => {
                      event.preventDefault();
                      const value = event.clipboardData
                        .getData('text')
                        .trim()
                        .replace(/\s*(₫|đ|VND)\s*$/i, '')
                        .trim();
                      if (!/^(?:\d+|\d{1,3}(?:,\d{3})+|\d{1,3}(?:\.\d{3})+)$/.test(value)) {
                        showToast({
                          type: TYPE_TOAST.ERROR,
                          content: 'Vui lòng nhập số tiền nguyên VND, không có phần thập phân'
                        });
                        return;
                      }
                      form.setValue('contractValue', formatIntegerWithCommas(value), {
                        shouldDirty: true,
                        shouldValidate: true
                      });
                    }}
                  />
                  <AppTextFieldControl
                    name="discountPercent"
                    label="Chiết khấu"
                    placeholder="Nhập chiết khấu (%)"
                    control={control}
                    type="number"
                    allowDecimal
                  />
                  <div className="col-span-4 tablet:col-span-2 mobile:col-span-1">
                    <AppTakeNoteControl
                      name="note"
                      label="Ghi chú"
                      placeholder="Nhập ghi chú"
                      control={control}
                      maxLength={500}
                      showCount
                      autoSize={{ minRows: 4, maxRows: 6 }}
                    />
                  </div>
                </div>
              </section>
            </fieldset>
            <section className="rounded-radius-l border border-color-300 bg-color-50 p-16">
              <TextBase classNames="sub-title3 mb-12" text="Tài liệu đính kèm" />
              {savedId && files.length > 0 && (
                <div className="mb-12">Hợp đồng đã lưu. Bấm Lưu để tải lại các tệp còn lại.</div>
              )}
              <Upload.Dragger
                multiple
                disabled={detailLoading}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                fileList={files.map((file, index) => ({ uid: String(index), name: file.name }))}
                beforeUpload={(file) => {
                  addFile(file);
                  return false;
                }}
                onRemove={(file) => {
                  removeFile(Number(file.uid));
                  return true;
                }}
              >
                <CloudUploadOutlined className="mb-12 text-28 text-color-600" />
                <div>
                  Kéo thả file vào đây hoặc <span className="text-primary-600">Chọn tệp</span>
                </div>
                <div className="mt-4 text-12 text-color-500">
                  PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (Tối đa 10MB/tệp)
                </div>
              </Upload.Dragger>
            </section>
          </form>
        </Spin>

        <div className="fixed bottom-0 right-0 flex w-full justify-end border-color-300 bg-color-50 px-24 py-12">
          {renderActions()}
        </div>
      </div>
    </PageWithBreadcrumb>
  );
};

const ManageOperationContractForm = (props: ManageOperationContractFormProps) => {
  const id = useSearchParams().get('id');
  return <OperationContractFormContent key={`${props.isEditMode}-${id || 'new'}`} {...props} />;
};
export default ManageOperationContractForm;
