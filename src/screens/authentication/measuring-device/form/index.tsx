'use client';

import { Divider, Flex, Spin } from 'antd';
import ButtonBase from 'components/button';
import { AppDatePickerControl } from 'components/date-picker';
import { IconSvgLocal } from 'components/icon-vec-local';
import { AppSelectControl } from 'components/select';
import { TextBase } from 'components/text';
import { AppTextFieldControl } from 'components/text-field';
import { ROUTES } from 'config/routes';
import PageWithBreadcrumb from 'layout/AppLayout/PageWithBreadcumb';
import Link from 'next/link';
import useMeasuringDeviceForm, { MeasuringDeviceFormProps } from '../hooks/useMeasuringDeviceForm';
import { DEVICE_STATUS_OPTIONS, DEVICE_TYPE_OPTIONS } from '../utils';

const mark = <span className="text-error-600">*</span>;

const MeasuringDeviceFormScreen = (props: MeasuringDeviceFormProps) => {
  const { form, title, loading, isView, isAddMode, submit, onBack } = useMeasuringDeviceForm(props);
  const {
    control,
    handleSubmit,
    formState: { isDirty, isValid }
  } = form;
  return (
    <PageWithBreadcrumb
      breadcrumbList={[
        { title: 'Thiết bị' },
        { title: <Link href={ROUTES.MEASURING_DEVICE_MANAGEMENT}>Quản lý TU/TI</Link> },
        { title }
      ]}
    >
      <section className={isView ? '' : 'mb-[76px]'}>
        <Flex justify="space-between" align="center">
          <div className="flex items-center gap-8">
            <IconSvgLocal
              name="ICON_ARROW_LINE_LEFT"
              height={24}
              width={24}
              classNames="cursor-pointer"
              onClick={onBack}
            />
            <TextBase classNames="title4" text={title} />
          </div>
        </Flex>
        <Divider className="my-16" />
        <form onSubmit={handleSubmit(submit)}>
          <div className="rounded-radius-l border border-color-300 bg-color-50 p-16">
            <TextBase classNames="sub-title3 mb-16" text="Thông tin chung" />
            <div className="grid grid-cols-3 gap-16 tablet:grid-cols-2 mobile:grid-cols-1">
              <AppTextFieldControl
                name="deviceCode"
                label="Mã TU/TI"
                labelSuffix={mark}
                placeholder="Nhập mã TU/TI"
                control={control}
                isView={isView}
                disabled={!isAddMode}
              />
              <AppTextFieldControl
                name="serialNumber"
                label="Số sê-ri"
                placeholder="Nhập số sê-ri"
                control={control}
                isView={isView}
              />
              <AppSelectControl
                name="deviceType"
                label="Loại"
                placeholder="Chọn loại"
                options={DEVICE_TYPE_OPTIONS}
                control={control}
                isView={isView}
              />
              <AppTextFieldControl
                name="manufacturer"
                label="Hãng sản xuất"
                placeholder="Nhập hãng sản xuất"
                control={control}
                isView={isView}
              />
              <AppTextFieldControl
                name="model"
                label="Model"
                placeholder="Nhập model"
                control={control}
                isView={isView}
              />
              <AppTextFieldControl
                name="ratio"
                label="Tỷ số biến"
                labelSuffix={mark}
                placeholder="Ví dụ: 22000/100"
                control={control}
                isView={isView}
              />
              <AppTextFieldControl
                name="accuracyClass"
                label="Cấp chính xác"
                placeholder="Ví dụ: 0.5"
                control={control}
                isView={isView}
              />
              <AppSelectControl
                name="status"
                label="Trạng thái"
                placeholder="Chọn trạng thái"
                options={DEVICE_STATUS_OPTIONS}
                control={control}
                isView={isView}
              />
            </div>
            <Divider className="my-16" />
            <TextBase classNames="sub-title3 mb-16" text="Thông tin thời điểm" />
            <div className="grid grid-cols-2 gap-16 tablet:grid-cols-1">
              <AppDatePickerControl
                name="purchaseDate"
                label="Ngày mua"
                backendFormat="DD-MM-YYYY"
                wrapperClassName="w-full"
                datePickerClassName="w-full"
                control={control}
                isView={isView}
              />
              <AppDatePickerControl
                name="installedDate"
                label="Ngày lắp đặt"
                backendFormat="DD-MM-YYYY"
                wrapperClassName="w-full"
                datePickerClassName="w-full"
                control={control}
                isView={isView}
              />
              <AppDatePickerControl
                name="inspectionDate"
                label="Ngày kiểm định"
                backendFormat="DD-MM-YYYY"
                wrapperClassName="w-full"
                datePickerClassName="w-full"
                control={control}
                isView={isView}
              />
              <AppDatePickerControl
                name="inspectionDueDate"
                label="Ngày đến hạn kiểm định"
                backendFormat="DD-MM-YYYY"
                wrapperClassName="w-full"
                datePickerClassName="w-full"
                control={control}
                isView={isView}
              />
            </div>
            <Divider className="my-16" />
            <AppTextFieldControl
              name="note"
              label="Ghi chú"
              placeholder="Nhập ghi chú"
              control={control}
              isView={isView}
            />
          </div>
          {!isView && (
            <div className="fixed bottom-0 left-[254px] right-0 z-[9] bg-color-50 tablet:left-0">
              <div className="flex justify-end gap-16 px-24 py-16">
                <ButtonBase type="ghost" customContent="Hủy" onClick={onBack} />
                <ButtonBase
                  type="primary"
                  htmlType="submit"
                  disabled={!isValid || (!isAddMode && !isDirty) || loading}
                  customContent={
                    <span className="flex items-center gap-8">
                      Lưu {loading && <Spin size="small" />}
                    </span>
                  }
                />
              </div>
            </div>
          )}
        </form>
      </section>
    </PageWithBreadcrumb>
  );
};
export default MeasuringDeviceFormScreen;
