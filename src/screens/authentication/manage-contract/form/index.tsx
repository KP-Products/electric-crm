'use client';

import { K_SIZE_8, REQUIRED_MARK } from '@constant';
import { Divider, Flex, Spin } from 'antd';
import ButtonBase from 'components/button';
import { AppDatePickerControl } from 'components/date-picker';
import { IconSvgLocal } from 'components/icon-vec-local';
import { AppSelectControl } from 'components/select';
import { AppTakeNoteControl } from 'components/take-note';
import { TextBase } from 'components/text';
import { AppTextField, AppTextFieldControl } from 'components/text-field';
import { ROUTES } from 'config/routes';
import PageWithBreadcrumb from 'layout/AppLayout/PageWithBreadcumb';
import { CONTRACT_STATUS_OPTIONS } from '../utils';
import useContractForm from '../hooks/useContractForm';

const requiredMark = <span className="text-error-600">{REQUIRED_MARK}</span>;

interface ManageContractFormProps {
  isEditMode: boolean;
}

const ManageContractForm = ({ isEditMode }: ManageContractFormProps) => {
  const {
    dateApiFormat,
    form,
    isCopyMode,
    isCopyCustomerUnchanged,
    detailLoading,
    customerOptions,
    meterOptions,
    selectedMeterId,
    selectedMeterMultiplier,
    onOpenCustomerDropdown,
    customerDropdownRender,
    onOpenMeterDropdown,
    meterDropdownRender,
    onBack,
    onSubmit
  } = useContractForm({ isEditMode });

  const {
    control,
    handleSubmit,
    formState: { isDirty, isValid }
  } = form;

  const title = isEditMode ? 'Cập nhật hợp đồng mua bán điện' : 'Thêm mới hợp đồng mua bán điện';
  const isCopiedFieldDisabled = isCopyMode;
  const isSaveDisabled =
    !isValid || Boolean(isEditMode && !isDirty) || isCopyCustomerUnchanged || detailLoading;

  const breadcrumbList = [
    {
      title: 'Trang chủ'
    },
    {
      title: 'Hợp đồng',
      key: ROUTES.MANAGE_CONTRACT
    },
    {
      title: isEditMode ? 'Cập nhật' : 'Thêm mới'
    }
  ];

  const renderActions = () => (
    <Flex justify="end" gap={K_SIZE_8}>
      <ButtonBase
        type="ghost"
        leftIcon="IC_CLOSE_OUTLINE"
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
        form="contract-form"
        htmlType="submit"
        classNames="app-common-btn"
        disabled={isSaveDisabled}
      />
    </Flex>
  );

  return (
    <PageWithBreadcrumb breadcrumbList={breadcrumbList}>
      <div className="mb-[76px] pb-24">
        <Flex
          justify="space-between"
          align="center"
          gap={K_SIZE_8}
          className="min-h-44 tablet:min-h-0 tablet:flex-col tablet:items-start"
        >
          <TextBase classNames="title4" text={title} />
        </Flex>
        <Divider className="my-16" />

        <Spin spinning={detailLoading && (isEditMode || isCopyMode)}>
          <form id="contract-form" onSubmit={handleSubmit(onSubmit)}>
            <section className="rounded-radius-l border border-color-300 bg-color-50 p-16">
              <TextBase classNames="sub-title3 mb-16 !text-primary-700" text="Thông tin hợp đồng" />
              <div className="grid grid-cols-4 gap-16 tablet:grid-cols-2 mobile:grid-cols-1">
                <AppTextFieldControl
                  name="contractNumber"
                  label="Số hợp đồng"
                  labelSuffix={requiredMark}
                  placeholder="Nhập số hợp đồng"
                  control={control}
                  disabled={isEditMode || isCopiedFieldDisabled}
                />
                <AppSelectControl
                  name="customerId"
                  label="Khách hàng"
                  labelSuffix={requiredMark}
                  placeholder="Chọn khách hàng"
                  options={customerOptions}
                  dropdownRender={customerDropdownRender}
                  onOpenChange={onOpenCustomerDropdown}
                  suffix={<IconSvgLocal name="ICON_SEARCH" height={20} width={20} />}
                  control={control}
                />
                <AppSelectControl
                  name="meterId"
                  label="Công tơ"
                  labelSuffix={requiredMark}
                  placeholder="Chọn công tơ"
                  options={meterOptions}
                  dropdownRender={meterDropdownRender}
                  onOpenChange={onOpenMeterDropdown}
                  suffix={<IconSvgLocal name="ICON_SEARCH" height={20} width={20} />}
                  control={control}
                  disabled={isCopiedFieldDisabled}
                />
                {selectedMeterId && (
                  <AppTextField
                    name="meterMultiplier"
                    label="Hệ số nhân"
                    placeholder="-"
                    value={selectedMeterMultiplier}
                    disabled
                  />
                )}
                <AppSelectControl
                  name="status"
                  label="Trạng thái"
                  labelSuffix={requiredMark}
                  placeholder="Chọn trạng thái"
                  options={CONTRACT_STATUS_OPTIONS}
                  control={control}
                  disabled={isCopiedFieldDisabled}
                />
                <AppDatePickerControl
                  name="signedDate"
                  label="Ngày ký kết"
                  labelSuffix={REQUIRED_MARK}
                  labelSuffixClassName="text-error-600"
                  placeholder="dd/mm/yyyy"
                  backendFormat={dateApiFormat}
                  wrapperClassName="w-full"
                  datePickerClassName="w-full"
                  control={control}
                  disabled={isCopiedFieldDisabled}
                />
                <AppDatePickerControl
                  name="effectiveDate"
                  label="Ngày hiệu lực"
                  labelSuffix={REQUIRED_MARK}
                  labelSuffixClassName="text-error-600"
                  placeholder="dd/mm/yyyy"
                  backendFormat={dateApiFormat}
                  wrapperClassName="w-full"
                  datePickerClassName="w-full"
                  control={control}
                  disabled={isCopiedFieldDisabled}
                />
                <AppDatePickerControl
                  name="expiryDate"
                  label="Ngày hết hiệu lực"
                  placeholder="dd/mm/yyyy"
                  backendFormat={dateApiFormat}
                  allowClear
                  wrapperClassName="w-full"
                  datePickerClassName="w-full"
                  control={control}
                  disabled={isCopiedFieldDisabled}
                />
                <div className="col-span-4 tablet:col-span-2 mobile:col-span-1">
                  <AppTakeNoteControl
                    name="note"
                    label="Ghi chú"
                    placeholder="Nhập ghi chú (nếu có)"
                    control={control}
                    maxLength={500}
                    showCount
                    autoSize={{ minRows: 5, maxRows: 7 }}
                    disabled={isCopiedFieldDisabled}
                  />
                </div>
              </div>
            </section>
          </form>
        </Spin>

        <div className="fixed bottom-0 right-0 flex w-full items-center justify-between border-color-300 bg-color-50 px-24 py-12 mobile:flex-col mobile:items-stretch mobile:gap-8 mobile:px-12">
          <div className="text-14 font-medium text-color-700">
            <span className="text-error-600">{REQUIRED_MARK}</span> Các trường bắt buộc
          </div>
          {renderActions()}
        </div>
      </div>
    </PageWithBreadcrumb>
  );
};

export default ManageContractForm;
