'use client';

import { K_SIZE_24, K_SIZE_8, REQUIRED_MARK } from '@constant';
import { Divider, Flex, Spin } from 'antd';
import clsx from 'clsx';
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

const ManageOperationContractForm = ({ isEditMode }: ManageOperationContractFormProps) => {
  const {
    dateApiFormat,
    form,
    detailLoading,
    operationUnitOptions,
    onOpenOperationUnitDropdown,
    operationUnitDropdownRender,
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
        disabled={!isValid || Boolean(isEditMode && !isDirty) || detailLoading}
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
            <section className="rounded-radius-l border border-color-300 bg-color-50 p-16">
              <TextBase classNames="sub-title3 mb-16 !text-primary-700" text="Thông tin hợp đồng" />
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
                  name="operationUnitId"
                  label="Đơn vị vận hành"
                  labelSuffix={requiredMark}
                  placeholder="Chọn đơn vị vận hành"
                  options={operationUnitOptions}
                  dropdownRender={operationUnitDropdownRender}
                  onOpenChange={onOpenOperationUnitDropdown}
                  control={control}
                />
                <AppSelectControl
                  name="status"
                  label="Trạng thái"
                  placeholder="Chọn trạng thái"
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
                <AppTextFieldControl
                  name="contractType"
                  label="Loại hợp đồng"
                  labelSuffix={requiredMark}
                  placeholder={OPERATION_CONTRACT_DEFAULT_TYPE}
                  control={control}
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
          </form>
        </Spin>

        <div className="fixed bottom-0 right-0 flex w-full justify-end border-color-300 bg-color-50 px-24 py-12">
          {renderActions()}
        </div>
      </div>
    </PageWithBreadcrumb>
  );
};

export default ManageOperationContractForm;
