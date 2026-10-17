'use client';

import { DeleteOutlined } from '@ant-design/icons';
import { K_SIZE_24, K_SIZE_8, REQUIRED_MARK } from '@constant';
import { Divider, Flex, Spin, Tooltip } from 'antd';
import ButtonBase from 'components/button';
import { AppDatePickerControl } from 'components/date-picker';
import { IconSvgLocal } from 'components/icon-vec-local';
import { AppSelectControl } from 'components/select';
import { AppTakeNoteControl } from 'components/take-note';
import { TextBase } from 'components/text';
import { AppTextFieldControl } from 'components/text-field';
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
    detailLoading,
    customerOptions,
    onOpenCustomerDropdown,
    customerDropdownRender,
    meterLineFields,
    meterLoading,
    meterError,
    metersEmpty,
    feederLoading,
    feederError,
    feedersEmpty,
    feedersLoaded,
    onRetryMeters,
    onRetryFeeders,
    feederOptions,
    getMeterOptionsForLine,
    metersLoaded,
    onChangeCustomer,
    onSelectMeter,
    onAddMeterLine,
    onRemoveMeterLine,
    onBack,
    onSubmit
  } = useContractForm({ isEditMode });

  const {
    control,
    handleSubmit,
    watch,
    formState: { isDirty, isValid, errors }
  } = form;
  const selectedCustomerId = watch('customerId');
  const watchedMeters = watch('meters');

  const title = isEditMode ? 'Cập nhật hợp đồng mua bán điện' : 'Thêm mới hợp đồng mua bán điện';
  const isSaveDisabled =
    !isValid ||
    Boolean(isEditMode && !isDirty) ||
    detailLoading ||
    meterLoading ||
    !metersLoaded ||
    feederLoading ||
    !feedersLoaded;

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

        <Spin spinning={detailLoading && (isEditMode || isCopyMode)}>
          <form id="contract-form" onSubmit={handleSubmit(onSubmit)}>
            <section className="rounded-radius-l border border-color-300 bg-color-50 p-16">
              <TextBase classNames="sub-title3 mb-16 !text-primary-700" text="Thông tin hợp đồng" />
              <div className="grid grid-cols-3 gap-16 tablet:grid-cols-2 mobile:grid-cols-1">
                <AppTextFieldControl
                  name="contractNumber"
                  label="Số hợp đồng"
                  labelSuffix={requiredMark}
                  placeholder="Nhập số hợp đồng"
                  control={control}
                  disabled={isEditMode}
                />
                <AppSelectControl
                  onChange={onChangeCustomer}
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
                  name="status"
                  label="Trạng thái"
                  labelSuffix={requiredMark}
                  placeholder="Chọn trạng thái"
                  options={CONTRACT_STATUS_OPTIONS}
                  control={control}
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
                />
                <div className="col-span-3 tablet:col-span-2 mobile:col-span-1">
                  <AppTakeNoteControl
                    name="note"
                    label="Ghi chú"
                    placeholder="Nhập ghi chú (nếu có)"
                    control={control}
                    maxLength={500}
                    showCount
                    autoSize={{ minRows: 5, maxRows: 7 }}
                  />
                </div>
              </div>
            </section>

            <section className="mt-16 rounded-radius-l border border-color-300 bg-color-50 p-16">
              <TextBase classNames="sub-title3 mb-16 !text-primary-700" text="Danh sách công tơ" />
              {!selectedCustomerId && (
                <TextBase
                  classNames="mb-12 text-14 text-color-600"
                  text="Chọn khách hàng trước để hiện danh sách công tơ của khách hàng."
                />
              )}
              {meterError && (
                <div role="alert" className="mb-12 flex items-center gap-12 text-error-600">
                  <span>{meterError}. Chưa thể lưu hợp đồng.</span>
                  <ButtonBase
                    type="ghost"
                    customContent="Thử lại công tơ"
                    onClick={onRetryMeters}
                    disabled={meterLoading}
                  />
                </div>
              )}
              {feederError && (
                <div role="alert" className="mb-12 flex items-center gap-12 text-error-600">
                  <span>{feederError}. Chưa thể lưu hợp đồng.</span>
                  <ButtonBase
                    type="ghost"
                    customContent="Thử lại lộ"
                    onClick={onRetryFeeders}
                    disabled={feederLoading}
                  />
                </div>
              )}
              {metersEmpty && (
                <div role="status" className="mb-12 flex items-center gap-12 text-color-700">
                  <span>
                    Không có công tơ phù hợp với khách hàng đã chọn. Chọn khách hàng khác hoặc tải
                    lại sau khi bổ sung công tơ.
                  </span>
                  <ButtonBase
                    type="ghost"
                    customContent="Tải lại công tơ"
                    onClick={onRetryMeters}
                    disabled={meterLoading}
                  />
                </div>
              )}
              {feedersEmpty && (
                <div role="status" className="mb-12 flex items-center gap-12 text-color-700">
                  <span>Chưa có lộ để chọn. Bổ sung lộ rồi tải lại danh sách.</span>
                  <ButtonBase
                    type="ghost"
                    customContent="Tải lại lộ"
                    onClick={onRetryFeeders}
                    disabled={feederLoading}
                  />
                </div>
              )}
              {feederLoading && <div className="mb-12 text-14">Đang tải danh sách lộ...</div>}
              <div className="overflow-x-auto">
                <div className="min-w-[760px]">
                  <div className="grid grid-cols-[56px_1.4fr_1fr_1fr_56px] gap-12 rounded-t-radius-m bg-color-100 p-12 text-14 font-semibold text-color-700">
                    <div>STT</div>
                    <div>Công tơ {requiredMark}</div>
                    <div>Lộ {requiredMark}</div>
                    <div>Ngày lắp đặt {requiredMark}</div>
                    <div />
                  </div>
                  {meterLineFields.map((field, index) => {
                    const selectedMeterId = watchedMeters?.[index]?.meterId;
                    return (
                      <div
                        key={field.id}
                        className="grid grid-cols-[56px_1.4fr_1fr_1fr_56px] items-start gap-12 border-b border-color-200 p-12"
                      >
                        <div className="pt-12 text-14">{index + 1}</div>
                        <div>
                          <AppSelectControl
                            name={`meters.${index}.meterId`}
                            placeholder={meterLoading ? 'Đang tải...' : 'Chọn công tơ'}
                            options={getMeterOptionsForLine(index)}
                            control={control}
                            disabled={!selectedCustomerId || meterLoading}
                            isLoading={meterLoading}
                            onChange={(value: string) => {
                              if (String(value) !== selectedMeterId)
                                onSelectMeter(index, String(value));
                            }}
                          />
                        </div>
                        <AppSelectControl
                          name={`meters.${index}.feederId`}
                          placeholder="Chọn lộ"
                          disabled={feederLoading || !feedersLoaded}
                          options={feederOptions}
                          control={control}
                        />
                        <AppDatePickerControl
                          name={`meters.${index}.installationDate`}
                          placeholder="dd/mm/yyyy"
                          backendFormat={dateApiFormat}
                          wrapperClassName="w-full"
                          datePickerClassName="w-full"
                          control={control}
                        />
                        <div className="pt-8">
                          <Tooltip title="Xoá">
                            <ButtonBase
                              type="ghost"
                              size={32}
                              classNames="!text-error-600"
                              customContent={<DeleteOutlined />}
                              disabled={meterLineFields.length <= 1}
                              onClick={() => onRemoveMeterLine(index)}
                            />
                          </Tooltip>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              {typeof errors.meters?.message === 'string' && (
                <div className="mt-8 text-14 text-error-600">{errors.meters.message}</div>
              )}
              <ButtonBase
                type="ghost"
                leftIcon="IC_ADD_OUTLINE2"
                customContent="Thêm dòng"
                onClick={onAddMeterLine}
                classNames="app-common-btn mt-12"
              />
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
