'use client';

import {
  K_SIZE_0,
  K_SIZE_1,
  K_SIZE_100,
  K_SIZE_130,
  K_SIZE_180,
  K_SIZE_200,
  K_SIZE_24,
  K_SIZE_8,
  NULL_VALUE
} from '@constant';
import { Divider, Flex, Spin } from 'antd';
import ButtonBase from 'components/button';
import { IconSvgLocal } from 'components/icon-vec-local';
import Status, { KIND_STATUS } from 'components/status';
import AppTable from 'components/table';
import { TextBase } from 'components/text';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import { ROUTES } from 'config/routes';
import PageWithBreadcrumb from 'layout/AppLayout/PageWithBreadcumb';
import { ErrorBase } from 'model/common';
import { Contract } from 'model/contract';
import { CustomerDetail } from 'model/customer';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import contractServices from 'services/contract-services';
import customerServices from 'services/customer-services';
import { displayDateFromServer, displayDateTimeFromServer } from 'utils/date';
import { getContractMeterCodes, getContractStatusMeta } from '../../manage-contract/utils';

const SUCCESS_MESSAGES = ['success', 'ok'];
const SUCCESS_CODE_STATUSES = [
  ...SUCCESS_MESSAGES,
  '0',
  '00',
  '000',
  '0000',
  '00000',
  '000000',
  '200',
  '201',
  '204'
];

const normalizeApiText = (value?: unknown) =>
  String(value || '')
    .trim()
    .toLowerCase();

const hasApiError = (
  response?: ErrorBase & {
    codeStatus?: string;
    error?: unknown;
    status?: number;
    statusCode?: number;
    message?: string;
  }
) => {
  if (!response) return true;

  const status = Number(response.status ?? response.statusCode);
  const normalizedCodeStatus = normalizeApiText(response.codeStatus);
  const hasResponseError = Boolean(
    response.businessErrorMessage ||
      response.systemErrorMessage ||
      response.detailMessage ||
      response.error
  );

  if ((Number.isFinite(status) && status >= 400) || hasResponseError) return true;
  if (SUCCESS_MESSAGES.includes(normalizeApiText(response.message))) return false;

  return Boolean(
    normalizedCodeStatus &&
      !SUCCESS_CODE_STATUSES.includes(normalizedCodeStatus) &&
      !normalizedCodeStatus.startsWith('2')
  );
};

const getCustomerErrorMessage = (
  error?: ErrorBase & { message?: string },
  fallback = 'Thao tác thất bại'
) => {
  const message =
    error?.businessErrorMessage ||
    error?.systemErrorMessage ||
    error?.detailMessage ||
    error?.message;
  return message && !SUCCESS_MESSAGES.includes(normalizeApiText(message)) ? message : fallback;
};

const displayText = (value?: string | number | null) => {
  if (value === undefined || value === null || value === '') return NULL_VALUE;
  return String(value);
};

const renderDate = (date?: string | null) => (date ? displayDateFromServer(date) : NULL_VALUE);

const renderDateTime = (date?: string | null) =>
  date ? displayDateTimeFromServer(date) : NULL_VALUE;

const DetailItem = ({ label, value }: { label: string; value: ReactNode }) => (
  <div className="min-w-0">
    <TextBase classNames="body3 !text-color-600" text={label} />
    <div className="mt-4 min-h-20 break-words text-14 font-semibold text-color-900">
      {value || NULL_VALUE}
    </div>
  </div>
);

const ManageCustomerDetailScreen = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const customerId = id ? Number(id) : undefined;
  const mountedRef = useRef<boolean>(true);
  const [detail, setDetail] = useState<CustomerDetail>();
  const [detailLoading, setDetailLoading] = useState<boolean>(false);
  const [detailLoadFailed, setDetailLoadFailed] = useState<boolean>(false);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [contractsLoading, setContractsLoading] = useState<boolean>(false);
  const [contractsLoadFailed, setContractsLoadFailed] = useState<boolean>(false);

  const customer = detail?.customer;
  const operationUnit = detail?.operationUnit;

  const onBack = useCallback(() => {
    router.push(ROUTES.MANAGE_CUSTOMER);
  }, [router]);

  const fetchCustomerDetail = useCallback(async () => {
    if (!customerId || !Number.isInteger(customerId)) return;

    setDetailLoading(true);
    setDetailLoadFailed(false);

    const response = await customerServices.getCustomerDetail({ id: customerId });
    if (!mountedRef.current) return;

    setDetailLoading(false);

    if (hasApiError(response) || !response.data) {
      setDetail(undefined);
      setDetailLoadFailed(true);
      showToast({
        type: TYPE_TOAST.ERROR,
        content: getCustomerErrorMessage(response, 'Tải chi tiết khách hàng thất bại')
      });
      return;
    }

    setDetail(response.data);
  }, [customerId]);

  const fetchContracts = useCallback(async () => {
    if (!customerId || !Number.isInteger(customerId)) return;

    setContractsLoading(true);
    setContractsLoadFailed(false);

    const response = await contractServices.searchContract({
      page: K_SIZE_0,
      size: K_SIZE_200,
      customerId
    });
    if (!mountedRef.current) return;

    setContractsLoading(false);

    if (hasApiError(response) || !response.data) {
      setContracts([]);
      setContractsLoadFailed(true);
      showToast({
        type: TYPE_TOAST.ERROR,
        content: getCustomerErrorMessage(response, 'Tải danh sách hợp đồng đã ký thất bại')
      });
      return;
    }

    setContracts(Array.isArray(response.data.items) ? response.data.items : []);
  }, [customerId]);

  useEffect(
    () => () => {
      mountedRef.current = false;
    },
    []
  );

  useEffect(() => {
    if (!id) {
      showToast({ type: TYPE_TOAST.ERROR, content: 'Không tìm thấy ID khách hàng' });
      onBack();
      return;
    }

    fetchCustomerDetail();
    fetchContracts();
  }, [fetchContracts, fetchCustomerDetail, id, onBack]);

  const onOpenEdit = useCallback(() => {
    if (!customer?.id) {
      showToast({ type: TYPE_TOAST.ERROR, content: 'Không tìm thấy ID khách hàng để cập nhật' });
      return;
    }

    router.push(`${ROUTES.MANAGE_CUSTOMER_EDIT}?id=${encodeURIComponent(String(customer.id))}`);
  }, [customer?.id, router]);

  const operationUnitLabel =
    operationUnit && [operationUnit.unitCode, operationUnit.unitName].filter(Boolean).join(' - ');

  const contractColumns = useMemo<any[]>(
    () => [
      {
        title: 'STT',
        key: 'index',
        width: K_SIZE_100,
        align: 'center',
        render: (_: unknown, __: Contract, index: number) => index + K_SIZE_1
      },
      {
        title: 'Số hợp đồng',
        dataIndex: 'contractNumber',
        key: 'contractNumber',
        width: K_SIZE_180,
        render: (text: string, record: Contract) =>
          record.id ? (
            <button
              type="button"
              className="text-left text-primary-600 underline"
              onClick={() =>
                router.push(
                  `${ROUTES.MANAGE_CONTRACT_DETAIL}?id=${encodeURIComponent(String(record.id))}`
                )
              }
            >
              {displayText(text)}
            </button>
          ) : (
            displayText(text)
          )
      },
      {
        title: 'Công tơ',
        key: 'meters',
        width: K_SIZE_180,
        render: (_: unknown, record: Contract) => getContractMeterCodes(record, 3) || '-'
      },
      {
        title: 'Ngày ký',
        dataIndex: 'signedDate',
        key: 'signedDate',
        width: K_SIZE_130,
        render: (date: string) => renderDate(date)
      },
      {
        title: 'Ngày hiệu lực',
        dataIndex: 'effectiveDate',
        key: 'effectiveDate',
        width: K_SIZE_130,
        render: (date: string) => renderDate(date)
      },
      {
        title: 'Ngày hết hạn',
        dataIndex: 'expiryDate',
        key: 'expiryDate',
        width: K_SIZE_130,
        render: (date: string) => renderDate(date)
      },
      {
        title: 'Trạng thái',
        dataIndex: 'status',
        key: 'status',
        width: K_SIZE_130,
        render: (status: string) => {
          const meta = getContractStatusMeta(status);
          return <Status type={meta.type} kind={KIND_STATUS.PRIMARY} content={meta.label} />;
        }
      }
    ],
    [router]
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
      title: 'Chi tiết khách hàng'
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
          <div>
            <div className={'flex items-center gap-8'}>
              <IconSvgLocal
                classNames="cursor-pointer"
                name="ICON_ARROW_LINE_LEFT"
                height={K_SIZE_24}
                width={K_SIZE_24}
                onClick={onBack}
              />
              <TextBase classNames="title4" text="Chi tiết khách hàng" />
            </div>
          </div>
          <ButtonBase
            type="primary"
            leftIcon="ICON_EDIT"
            customContent="Chỉnh sửa"
            disabled={!customer?.id || detailLoading}
            onClick={onOpenEdit}
            classNames="mobile:w-full mobile:justify-center"
          />
        </Flex>

        <Divider className="my-16" />

        <Spin spinning={detailLoading}>
          <section className="rounded-radius-l border border-color-300 bg-color-50 p-16">
            <TextBase classNames="sub-title3 mb-24 !text-primary-700" text="Thông tin khách hàng" />
            {detailLoadFailed && (
              <div className="mb-16 rounded-radius-m border border-error-200 bg-error-50 p-12 text-14 font-medium text-error-600">
                Không tải được chi tiết khách hàng.
              </div>
            )}
            <div className="grid grid-cols-3 gap-x-32 gap-y-24 tablet:grid-cols-2 mobile:grid-cols-1">
              <DetailItem label="Mã khách hàng" value={displayText(customer?.customerCode)} />
              <DetailItem label="Tên khách hàng" value={displayText(customer?.fullName)} />
              <DetailItem label="Mã số thuế" value={displayText(customer?.taxNo)} />
              <DetailItem label="Số điện thoại" value={displayText(customer?.phone)} />
              <DetailItem label="Email" value={displayText(customer?.email)} />
              <DetailItem label="Người liên hệ" value={displayText(customer?.contactName)} />
              <DetailItem
                label="CMND/CCCD người liên hệ"
                value={displayText(customer?.contactIdNo)}
              />
              <DetailItem
                label="Ngày cấp CMND/CCCD"
                value={renderDate(customer?.contactIssueDate)}
              />
              <DetailItem label="Địa chỉ" value={displayText(customer?.address)} />
              <DetailItem
                label="Đơn vị vận hành"
                value={operationUnitLabel || displayText(customer?.operationUnitId)}
              />
              <DetailItem label="Ngày tạo" value={renderDateTime(customer?.createdAt)} />
              <DetailItem label="Ngày cập nhật" value={renderDateTime(customer?.updatedAt)} />
            </div>
          </section>
        </Spin>

        <section className="mt-16 rounded-radius-l border border-color-300 bg-color-50 p-16">
          <Flex justify="space-between" align="center" className="mb-16">
            <TextBase classNames="sub-title3 !text-primary-700" text="Hợp đồng đã ký" />
            {contractsLoading && <Spin size="small" />}
          </Flex>
          {contractsLoadFailed ? (
            <div className="text-14 font-medium text-color-700">
              Không tải được danh sách hợp đồng đã ký
            </div>
          ) : contractsLoading ? (
            <div className="rounded-radius-m border border-color-300 p-16 text-center">
              <Spin size="small" />
            </div>
          ) : contracts.length > K_SIZE_0 ? (
            <div className="overflow-hidden rounded-radius-l border border-color-400">
              <AppTable
                loading={contractsLoading}
                rootClassName="w-full"
                className="[&_.ant-pagination]:hidden"
                scroll={{ x: 'max-content' }}
                dataSource={contracts}
                columns={contractColumns}
                rowKey={(record: any, index?: number) =>
                  String(record.id || record.contractNumber || index)
                }
                pagination={false}
              />
            </div>
          ) : (
            <div className="text-14 font-medium text-color-700">Chưa có hợp đồng đã ký</div>
          )}
        </section>
      </section>
    </PageWithBreadcrumb>
  );
};

export default ManageCustomerDetailScreen;
