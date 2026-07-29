'use client';

import { K_SIZE_0, K_SIZE_200, K_SIZE_24, K_SIZE_8, REQUIRED_MARK } from '@constant';
import { zodResolver } from '@hookform/resolvers/zod';
import { Divider, Flex, Spin } from 'antd';
import ButtonBase from 'components/button';
import { AppDatePickerControl } from 'components/date-picker';
import { IconSvgLocal } from 'components/icon-vec-local';
import { AppSelectControl } from 'components/select';
import { TextBase } from 'components/text';
import { AppTextFieldControl } from 'components/text-field';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import { ROUTES } from 'config/routes';
import PageWithBreadcrumb from 'layout/AppLayout/PageWithBreadcumb';
import { Customer } from 'model/customer';
import { OperationUnit } from 'model/operation-unit';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import customerServices from 'services/customer-services';
import operationUnitServices from 'services/operation-unit-services';
import { FORMAT_DATE_API } from 'utils/date';
import {
  CustomerForm,
  buildFormValues,
  buildUpdateBody,
  customerSchema,
  getCustomerErrorMessage,
  hasApiError
} from '../useManageCustomer';

const requiredMark = <span className="text-error-600">{REQUIRED_MARK}</span>;

const ManageCustomerEditScreen = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const customerId = id ? Number(id) : undefined;
  const mountedRef = useRef<boolean>(true);

  const [customer, setCustomer] = useState<Customer>();
  const [detailLoading, setDetailLoading] = useState<boolean>(false);
  const [detailLoadFailed, setDetailLoadFailed] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [operationUnitLoading, setOperationUnitLoading] = useState<boolean>(false);
  const [operationUnitOptions, setOperationUnitOptions] = useState<
    { value: string; label: string }[]
  >([]);

  const form = useForm<CustomerForm>({
    mode: 'onTouched',
    defaultValues: buildFormValues(),
    resolver: zodResolver(customerSchema)
  });

  const {
    control,
    handleSubmit,
    formState: { isValid, isDirty }
  } = form;

  const detailUrl = id
    ? `${ROUTES.MANAGE_CUSTOMER_DETAIL}?id=${encodeURIComponent(id)}`
    : ROUTES.MANAGE_CUSTOMER;

  const onBack = useCallback(() => {
    router.push(detailUrl);
  }, [detailUrl, router]);

  const fetchCustomerDetail = useCallback(async () => {
    if (!customerId || !Number.isInteger(customerId)) return;

    setDetailLoading(true);
    setDetailLoadFailed(false);

    const response = await customerServices.getCustomerDetail({ id: customerId });
    if (!mountedRef.current) return;

    setDetailLoading(false);

    if (hasApiError(response) || !response.data?.customer) {
      setCustomer(undefined);
      setDetailLoadFailed(true);
      showToast({
        type: TYPE_TOAST.ERROR,
        content: getCustomerErrorMessage(response, 'Tải thông tin khách hàng thất bại')
      });
      return;
    }

    setCustomer(response.data.customer);
    form.reset(buildFormValues(response.data.customer));
  }, [customerId, form]);

  useEffect(
    () => () => {
      mountedRef.current = false;
    },
    []
  );

  useEffect(() => {
    if (!id) {
      showToast({ type: TYPE_TOAST.ERROR, content: 'Không tìm thấy ID khách hàng' });
      router.push(ROUTES.MANAGE_CUSTOMER);
      return;
    }

    fetchCustomerDetail();
  }, [fetchCustomerDetail, id, router]);

  useEffect(() => {
    const fetchOperationUnits = async () => {
      setOperationUnitLoading(true);
      const response = await operationUnitServices.searchOperationUnits({
        page: K_SIZE_0,
        size: K_SIZE_200
      });
      if (!mountedRef.current) return;

      setOperationUnitLoading(false);

      if (hasApiError(response)) {
        showToast({
          type: TYPE_TOAST.ERROR,
          content: getCustomerErrorMessage(response, 'Tải danh sách đơn vị vận hành thất bại')
        });
        return;
      }

      const operationUnits = Array.isArray(response.data?.items) ? response.data.items : [];

      setOperationUnitOptions(
        operationUnits
          .filter((item: OperationUnit) => Boolean(item.operationUnitId))
          .map((item: OperationUnit) => ({
            value: item.operationUnitId,
            label:
              [item.unitCode, item.unitName].filter(Boolean).join(' - ') || item.operationUnitId
          }))
      );
    };

    fetchOperationUnits();
  }, []);

  const onSubmit = useCallback(
    async (data: CustomerForm) => {
      if (!customer?.id || submitting) return;

      setSubmitting(true);
      const response = await customerServices.updateCustomer(buildUpdateBody(customer.id, data));
      if (!mountedRef.current) return;
      setSubmitting(false);

      if (hasApiError(response)) {
        showToast({
          type: TYPE_TOAST.ERROR,
          content: getCustomerErrorMessage(response, 'Cập nhật khách hàng thất bại')
        });
        return;
      }

      showToast({ type: TYPE_TOAST.SUCCESS, content: 'Cập nhật khách hàng thành công' });
      router.push(`${ROUTES.MANAGE_CUSTOMER_DETAIL}?id=${encodeURIComponent(String(customer.id))}`);
    },
    [customer?.id, router, submitting]
  );

  const breadcrumbList = [
    {
      title: 'Hợp đồng'
    },
    {
      title: 'Khách hàng',
      key: ROUTES.MANAGE_CUSTOMER
    },
    {
      title: 'Cập nhật khách hàng'
    }
  ];

  return (
    <PageWithBreadcrumb breadcrumbList={breadcrumbList}>
      <section className="mb-[76px]">
        <Flex
          justify="space-between"
          align="center"
          gap={K_SIZE_8}
          className="mobile:flex-col mobile:items-start"
        >
          <div className="flex items-center gap-8">
            <IconSvgLocal
              classNames="cursor-pointer"
              name="ICON_ARROW_LINE_LEFT"
              height={K_SIZE_24}
              width={K_SIZE_24}
              onClick={onBack}
            />
            <TextBase classNames="title4" text="Cập nhật khách hàng" />
          </div>
        </Flex>

        <Divider className="my-16" />

        {detailLoadFailed && (
          <div className="mb-16 rounded-radius-m border border-error-200 bg-error-50 p-12 text-14 font-medium text-error-600">
            Không tải được thông tin khách hàng.
          </div>
        )}

        <Spin spinning={detailLoading}>
          <form id="customer-edit-form" onSubmit={handleSubmit(onSubmit)}>
            <section className="rounded-radius-l border border-color-300 bg-color-50 p-16">
              <TextBase
                classNames="sub-title3 mb-24 !text-primary-700"
                text="Thông tin khách hàng"
              />
              <div className="grid grid-cols-3 gap-16 tablet:grid-cols-2 mobile:grid-cols-1">
                <AppTextFieldControl
                  name="customerCode"
                  control={control}
                  label="Mã khách hàng"
                  labelSuffix={requiredMark}
                  placeholder="Nhập mã khách hàng"
                  disabled
                />
                <AppTextFieldControl
                  name="fullName"
                  control={control}
                  label="Tên khách hàng"
                  placeholder="Nhập tên khách hàng"
                />
                <AppTextFieldControl
                  name="taxNo"
                  label="Mã số thuế"
                  placeholder="Nhập mã số thuế"
                  control={control}
                />
                <AppTextFieldControl
                  name="phone"
                  label="Số điện thoại"
                  placeholder="Nhập số điện thoại"
                  control={control}
                />
                <AppTextFieldControl
                  name="email"
                  label="Email"
                  placeholder="Nhập email"
                  control={control}
                />
                <AppTextFieldControl
                  name="contactName"
                  label="Người liên hệ"
                  placeholder="Nhập người liên hệ"
                  control={control}
                />
                <AppTextFieldControl
                  name="contactIdNo"
                  label="CMND/CCCD người liên hệ"
                  placeholder="Nhập CMND/CCCD"
                  control={control}
                />
                <AppDatePickerControl
                  name="contactIssueDate"
                  control={control}
                  backendFormat={FORMAT_DATE_API}
                  label="Ngày cấp CMND/CCCD"
                  wrapperClassName="w-full"
                  datePickerClassName="w-full"
                />
                <AppSelectControl
                  name="operationUnitId"
                  label="Đơn vị vận hành"
                  placeholder="Chọn đơn vị vận hành"
                  isLoading={operationUnitLoading}
                  options={operationUnitOptions}
                  control={control}
                />
                <AppTextFieldControl
                  name="address"
                  label="Địa chỉ"
                  placeholder="Nhập địa chỉ"
                  control={control}
                />
              </div>
            </section>

            <div className="fixed bottom-0 left-[254px] right-0 z-[9] bg-color-50 tablet:left-0">
              <div className="flex justify-end gap-16 px-24 py-16 mobile:flex-col">
                <ButtonBase
                  classNames="app-common-btn flex justify-center items-center mobile:flex-1"
                  type="ghost"
                  customContent="Hủy"
                  onClick={onBack}
                  disabled={submitting}
                />
                <ButtonBase
                  classNames="app-common-btn flex justify-center items-center mobile:flex-1"
                  type="primary"
                  form="customer-edit-form"
                  htmlType="submit"
                  disabled={!isValid || !isDirty || submitting || detailLoading}
                  customContent={
                    <div className="flex flex-row items-center justify-center">
                      <div>Lưu</div>
                      {submitting && (
                        <div className="ml-8">
                          <Spin size="small" />
                        </div>
                      )}
                    </div>
                  }
                />
              </div>
            </div>
          </form>
        </Spin>
      </section>
    </PageWithBreadcrumb>
  );
};

export default ManageCustomerEditScreen;
