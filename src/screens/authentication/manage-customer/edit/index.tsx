'use client';

import { K_SIZE_24, K_SIZE_8, REQUIRED_MARK } from '@constant';
import { zodResolver } from '@hookform/resolvers/zod';
import { Divider, Flex, Spin } from 'antd';
import ButtonBase from 'components/button';
import { AppDatePickerControl } from 'components/date-picker';
import { IconSvgLocal } from 'components/icon-vec-local';
import { TextBase } from 'components/text';
import { AppTextFieldControl } from 'components/text-field';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import { ROUTES } from 'config/routes';
import PageWithBreadcrumb from 'layout/AppLayout/PageWithBreadcumb';
import { Customer } from 'model/customer';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import customerServices from 'services/customer-services';
import { FORMAT_DATE_API } from 'utils/date';
import documentServices from 'services/document-services';
import { DOCUMENT_OWNER_TYPE, DOCUMENT_TYPE } from 'model/document';
import CustomerDocuments from '../customer-documents';
import { customerDocumentOwnerId } from '../create-utils';
import {
  CustomerForm,
  buildFormValues,
  buildUpdateBody,
  customerSchema,
  getCustomerErrorMessage,
  hasApiError
} from '../useManageCustomer';

const requiredMark = <span className="text-error-600">{REQUIRED_MARK}</span>;

const CustomerEditForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const customerId = id ? Number(id) : undefined;
  const mountedRef = useRef<boolean>(true);

  const [files, setFiles] = useState<File[]>([]);
  const [documentRevision, setDocumentRevision] = useState(0);
  const submittingRef = useRef(false);
  const [customer, setCustomer] = useState<Customer>();
  const [detailLoading, setDetailLoading] = useState<boolean>(false);
  const [detailLoadFailed, setDetailLoadFailed] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

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

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!id) {
      showToast({ type: TYPE_TOAST.ERROR, content: 'Không tìm thấy ID khách hàng' });
      router.push(ROUTES.MANAGE_CUSTOMER);
      return;
    }

    fetchCustomerDetail();
  }, [fetchCustomerDetail, id, router]);

  const onSubmit = useCallback(
    async (data: CustomerForm) => {
      if (!customer?.id || submittingRef.current || !mountedRef.current) return;
      submittingRef.current = true;
      setSubmitting(true);
      try {
        if (isDirty) {
          const response = await customerServices.updateCustomer(
            buildUpdateBody(customer.id, data)
          );
          if (!mountedRef.current) return;
          if (hasApiError(response)) {
            showToast({
              type: TYPE_TOAST.ERROR,
              content: getCustomerErrorMessage(response, 'Cập nhật khách hàng thất bại')
            });
            return;
          }
          if (mountedRef.current) form.reset(data);
        }
        const failedFiles: File[] = [];
        for (const file of files) {
          if (!mountedRef.current) return;
          const response = await documentServices.uploadDocument({
            ownerType: DOCUMENT_OWNER_TYPE.CUSTOMER,
            ownerId: customerDocumentOwnerId(customer.id),
            docType: DOCUMENT_TYPE.KHAC,
            file
          });
          if (hasApiError(response) || !response.data?.id) failedFiles.push(file);
        }
        if (!mountedRef.current) return;
        setFiles(failedFiles);
        setDocumentRevision((value) => value + 1);
        if (failedFiles.length) {
          showToast({
            type: TYPE_TOAST.ERROR,
            content:
              'Thông tin đã lưu. Một số tài liệu tải lên thất bại, vui lòng bấm Lưu để thử lại.'
          });
          return;
        }
        showToast({ type: TYPE_TOAST.SUCCESS, content: 'Cập nhật khách hàng thành công' });
        router.push(
          `${ROUTES.MANAGE_CUSTOMER_DETAIL}?id=${encodeURIComponent(String(customer.id))}`
        );
      } catch {
        if (!mountedRef.current) return;
        showToast({ type: TYPE_TOAST.ERROR, content: 'Cập nhật khách hàng thất bại' });
      } finally {
        submittingRef.current = false;
        if (mountedRef.current) setSubmitting(false);
      }
    },
    [customer?.id, router, isDirty, files, form]
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
            <fieldset disabled={submitting || detailLoading || detailLoadFailed}>
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
                    maxLength={30}
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
                    maxLength={255}
                    label="Email"
                    placeholder="Nhập email"
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
                  <AppTextFieldControl
                    name="address"
                    label="Địa chỉ"
                    placeholder="Nhập địa chỉ"
                    control={control}
                  />
                </div>
                {(
                  [
                    { key: 'representative', label: 'Người đại diện' },
                    { key: 'chiefAccountant', label: 'Kế toán trưởng' },
                    { key: 'contactPerson', label: 'Người liên hệ' }
                  ] as const
                ).map((person) => (
                  <section key={person.key} className="mt-16 border-t border-color-300 pt-16">
                    <TextBase classNames="sub-title3 mb-12" text={person.label} />
                    <div className="grid grid-cols-4 gap-12 mobile:grid-cols-2">
                      <AppTextFieldControl
                        name={`${person.key}.fullName`}
                        label="Tên"
                        placeholder="Nhập tên"
                        control={control}
                        maxLength={255}
                      />
                      <AppTextFieldControl
                        name={`${person.key}.idNo`}
                        label="CCCD"
                        placeholder="Nhập CCCD"
                        control={control}
                        maxLength={12}
                      />
                      <AppTextFieldControl
                        name={`${person.key}.phone`}
                        label="SĐT"
                        placeholder="Nhập số điện thoại"
                        control={control}
                      />
                      <AppTextFieldControl
                        name={`${person.key}.email`}
                        label="Email"
                        placeholder="Nhập email"
                        control={control}
                        maxLength={255}
                      />
                    </div>
                  </section>
                ))}
                {customer?.id && (
                  <CustomerDocuments
                    customerId={customer.id}
                    files={files}
                    onFilesChange={setFiles}
                    disabled={submitting}
                    revision={documentRevision}
                  />
                )}
              </section>
            </fieldset>

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
                  disabled={
                    !isValid ||
                    (!isDirty && !files.length) ||
                    submitting ||
                    detailLoading ||
                    detailLoadFailed
                  }
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

// A new customer gets isolated form/upload state; old requests cannot update the new form.
const ManageCustomerEditScreen = () => {
  const searchParams = useSearchParams();
  return <CustomerEditForm key={searchParams.get('id') || 'missing-customer'} />;
};

export default ManageCustomerEditScreen;
