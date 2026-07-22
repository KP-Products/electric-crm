'use client';

import { K_SIZE_1, K_SIZE_18, K_SIZE_24, K_SIZE_8, NULL_VALUE } from '@constant';
import { Avatar, Divider, Flex, Spin, Tabs } from 'antd';
import ButtonBase from 'components/button';
import IconHover from 'components/icon-vec-local/icon-hover';
import { IconSvgLocal } from 'components/icon-vec-local';
import Status, { KIND_STATUS } from 'components/status';
import AppTable from 'components/table';
import { TextBase } from 'components/text';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import { ROUTES } from 'config/routes';
import PageWithBreadcrumb from 'layout/AppLayout/PageWithBreadcumb';
import { ErrorBase } from 'model/common';
import { EmployeeSalaryHistory } from 'model/employee';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { GET_EMPLOYEE_DETAIL } from '@redux-action-type/employee';
import { dispatch } from '@redux-common';
import { selectEmployeeLoadingDetail, selectSelectedEmployee } from '@redux-selector/employee';
import employeeServices from 'services/employee-services';
import {
  canViewBlobInline,
  downloadBlobResponse,
  getBlobResponseError,
  isBlobFileResponse
} from 'utils/blob-response';
import { displayDateFromServer } from 'utils/date';
import {
  INLINE_AVATAR_MIME_TYPES,
  INLINE_CONTRACT_MIME_TYPES,
  SALARY_CHANGE_TYPE_LABEL_MAP,
  displayText,
  formatSalary,
  getContractFileName,
  getEmployeeDisplayName,
  getEmployeeGenderLabel,
  getEmployeeInitials,
  getEmployeeErrorContent,
  getEmploymentStatusLabel,
  getEmploymentStatusType,
  getEmploymentTypeLabel
} from '../utils';

interface InfoItemProps {
  label: string;
  value?: React.ReactNode;
}

const InfoItem = ({ label, value }: InfoItemProps) => (
  <div className="min-w-0">
    <TextBase classNames="body3 !text-color-600" text={label} />
    <div className="mt-4 min-h-20 text-13 font-semibold leading-20 text-color-900">
      {value || NULL_VALUE}
    </div>
  </div>
);

const getSalaryChangeRate = (history: EmployeeSalaryHistory) => {
  if (!history.oldBasicSalary || !history.newBasicSalary) return NULL_VALUE;
  const rate = ((history.newBasicSalary - history.oldBasicSalary) / history.oldBasicSalary) * 100;
  const prefix = rate > 0 ? '+' : '';
  return `${prefix}${rate.toFixed(2)}%`;
};

const ManageEmployeeDetailScreen = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const detailLoading = useSelector(selectEmployeeLoadingDetail);
  const selectedEmployeeWithHistory = useSelector(selectSelectedEmployee);
  const employee = selectedEmployeeWithHistory?.employee;
  const salaryHistory = useMemo(
    () => selectedEmployeeWithHistory?.salaryHistory || [],
    [selectedEmployeeWithHistory?.salaryHistory]
  );
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState('');

  const onBack = useCallback(() => {
    router.push(ROUTES.EMPLOYEE_LIST);
  }, [router]);

  useEffect(() => {
    const numericId = Number(id);
    if (!id || Number.isNaN(numericId)) {
      showToast({ type: TYPE_TOAST.ERROR, content: 'Không tìm thấy nhân sự' });
      onBack();
      return;
    }

    dispatch({
      type: GET_EMPLOYEE_DETAIL,
      payload: {
        body: { id: numericId },
        onFailed: (error?: ErrorBase) => {
          showToast({
            type: TYPE_TOAST.ERROR,
            content: getEmployeeErrorContent(error, 'Tải thông tin nhân sự thất bại')
          });
          onBack();
        }
      }
    });
  }, [id, onBack]);

  useEffect(() => {
    if (!employee?.id || !employee.avatarUrl) {
      setAvatarPreviewUrl('');
      return;
    }

    let objectUrl = '';
    let disposed = false;
    employeeServices.viewEmployeeAvatar(employee.id).then(async (response) => {
      const fileError = await getBlobResponseError(response);
      if (
        fileError ||
        !isBlobFileResponse(response) ||
        !canViewBlobInline(response, INLINE_AVATAR_MIME_TYPES)
      ) {
        return;
      }

      objectUrl = URL.createObjectURL(response.blob);
      if (disposed) {
        URL.revokeObjectURL(objectUrl);
        return;
      }
      setAvatarPreviewUrl(objectUrl);
    });

    return () => {
      disposed = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [employee?.avatarUrl, employee?.id]);

  const onEdit = useCallback(() => {
    if (!employee?.id) return;
    router.push(`${ROUTES.EMPLOYEE_EDIT}?id=${employee.id}`);
  }, [employee?.id, router]);

  const onViewContractFile = useCallback(async () => {
    if (!employee?.id) return;
    if (!employee.contractFilePath && !employee.contractFileName) {
      showToast({ type: TYPE_TOAST.INFO, content: 'Nhân sự chưa có file hợp đồng' });
      return;
    }

    const targetWindow = window.open('about:blank', '_blank');
    if (targetWindow) {
      targetWindow.opener = null;
    }

    const response = await employeeServices.viewEmployeeContractFile(employee.id);
    const fileError = await getBlobResponseError(response);
    if (fileError || !isBlobFileResponse(response)) {
      targetWindow?.close();
      showToast({
        type: TYPE_TOAST.ERROR,
        content: getEmployeeErrorContent(fileError || response, 'Xem hợp đồng thất bại')
      });
      return;
    }

    if (!canViewBlobInline(response, INLINE_CONTRACT_MIME_TYPES)) {
      targetWindow?.close();
      showToast({
        type: TYPE_TOAST.INFO,
        content: 'Định dạng file này chỉ hỗ trợ tải xuống'
      });
      return;
    }

    const viewUrl = URL.createObjectURL(response.blob);
    if (targetWindow) {
      targetWindow.location.href = viewUrl;
    } else {
      window.open(viewUrl, '_blank', 'noopener,noreferrer');
    }
    window.setTimeout(() => URL.revokeObjectURL(viewUrl), 60000);
  }, [employee]);

  const onDownloadContractFile = useCallback(async () => {
    if (!employee?.id) return;
    if (!employee.contractFilePath && !employee.contractFileName) {
      showToast({ type: TYPE_TOAST.INFO, content: 'Nhân sự chưa có file hợp đồng' });
      return;
    }

    const response = await employeeServices.downloadEmployeeContractFile(employee.id);
    const fileError = await getBlobResponseError(response);
    if (fileError || !isBlobFileResponse(response)) {
      showToast({
        type: TYPE_TOAST.ERROR,
        content: getEmployeeErrorContent(fileError || response, 'Tải hợp đồng thất bại')
      });
      return;
    }

    downloadBlobResponse(response, getContractFileName(employee, response.fileName));
  }, [employee]);

  const salaryColumns = useMemo<any[]>(
    () => [
      {
        title: 'STT',
        key: 'index',
        width: 72,
        align: 'center',
        render: (_: unknown, __: EmployeeSalaryHistory, index: number) => index + K_SIZE_1
      },
      {
        title: 'Ngày hiệu lực',
        dataIndex: 'effectiveDate',
        key: 'effectiveDate',
        width: 130,
        render: (date: string) => displayDateFromServer(date)
      },
      {
        title: 'Lương cũ (VND)',
        dataIndex: 'oldBasicSalary',
        key: 'oldBasicSalary',
        width: 140,
        align: 'right',
        render: (value: number) => formatSalary(value)
      },
      {
        title: 'Lương mới (VND)',
        dataIndex: 'newBasicSalary',
        key: 'newBasicSalary',
        width: 140,
        align: 'right',
        render: (value: number) => formatSalary(value)
      },
      {
        title: 'Mức tăng',
        key: 'changeRate',
        width: 110,
        align: 'right',
        render: (_: unknown, record: EmployeeSalaryHistory) => {
          const rate = getSalaryChangeRate(record);
          const isDecrease = rate.startsWith('-');
          return <span className={isDecrease ? 'text-error-600' : 'text-success-600'}>{rate}</span>;
        }
      },
      {
        title: 'Lý do',
        dataIndex: 'reason',
        key: 'reason',
        width: 220,
        render: (text: string, record: EmployeeSalaryHistory) => (
          <div className="max-w-[260px]">
            <div>{displayText(SALARY_CHANGE_TYPE_LABEL_MAP[record.changeType || ''] || text)}</div>
            {record.decisionNumber && (
              <div className="text-12 text-color-600">{record.decisionNumber}</div>
            )}
          </div>
        )
      },
      {
        title: 'Người duyệt',
        dataIndex: 'approvedBy',
        key: 'approvedBy',
        width: 120,
        render: (value: number) => displayText(value)
      }
    ],
    []
  );

  const sortedSalaryHistory = useMemo(
    () =>
      [...salaryHistory].sort(
        (a, b) =>
          new Date(b.effectiveDate || '').getTime() - new Date(a.effectiveDate || '').getTime()
      ),
    [salaryHistory]
  );

  const commonInfo = (
    <div className="grid grid-cols-[240px_minmax(0,1fr)] gap-16 tablet:grid-cols-1">
      <aside className="rounded-radius-l border border-color-300 bg-color-50 p-16">
        <div className="flex flex-col items-center text-center">
          <Avatar
            size={132}
            src={avatarPreviewUrl || employee?.avatarUrl || undefined}
            className="mb-12 bg-primary-100 text-32 text-primary-700"
          >
            {getEmployeeInitials(employee)}
          </Avatar>
          <TextBase classNames="title4 mb-4" text={getEmployeeDisplayName(employee)} />
          <TextBase
            classNames="body2 mb-12 !text-secondary-700"
            text={displayText(employee?.employeeCode)}
          />
          <Status
            type={getEmploymentStatusType(employee?.employmentStatus)}
            kind={KIND_STATUS.SECONDARY}
            content={displayText(getEmploymentStatusLabel(employee?.employmentStatus))}
          />
        </div>
        <Divider className="my-16" />
        <InfoItem label="Trường phòng/Hành chính" value={displayText(employee?.departmentName)} />
      </aside>

      <section className="rounded-radius-l border border-color-300 bg-color-50 p-16">
        <div className="grid grid-cols-3 gap-12 tablet:grid-cols-2 mobile:grid-cols-1">
          <InfoItem label="Mã nhân sự" value={displayText(employee?.employeeCode)} />
          <InfoItem label="Họ và tên" value={displayText(employee?.fullName)} />
          <InfoItem
            label="Giới tính"
            value={displayText(getEmployeeGenderLabel(employee?.gender))}
          />
          <InfoItem label="Ngày sinh" value={displayDateFromServer(employee?.dateOfBirth || '')} />
          <InfoItem label="SĐT" value={displayText(employee?.phone)} />
          <InfoItem label="Email" value={displayText(employee?.email)} />
          <InfoItem label="Số CCCD" value={displayText(employee?.identityNumber)} />
          <InfoItem
            label="Ngày cấp"
            value={displayDateFromServer(employee?.identityIssueDate || '')}
          />
          <InfoItem label="Nơi cấp" value={displayText(employee?.identityIssuePlace)} />
          <InfoItem label="Mã số thuế" value={displayText(employee?.taxCode)} />
          <InfoItem label="Số BHXH" value={displayText(employee?.socialInsuranceNo)} />
          <InfoItem label="Phòng ban" value={displayText(employee?.departmentName)} />
          <InfoItem label="Chức vụ" value={displayText(employee?.positionName)} />
          <InfoItem label="Quản lý trực tiếp" value={displayText(employee?.managerId)} />
          <InfoItem label="Ngày vào làm" value={displayDateFromServer(employee?.hireDate || '')} />
          <InfoItem
            label="Ngày chính thức"
            value={displayDateFromServer(employee?.officialDate || '')}
          />
          <InfoItem
            label="Ngày nghỉ việc"
            value={displayDateFromServer(employee?.resignationDate || '')}
          />
          <InfoItem
            label="Loại nhân sự"
            value={displayText(getEmploymentTypeLabel(employee?.employmentType))}
          />
          <InfoItem label="Lương cơ bản" value={`${formatSalary(employee?.basicSalary)} VND`} />
          <InfoItem label="Trình độ" value={displayText(employee?.qualifications)} />
          <InfoItem label="Ngân hàng" value={displayText(employee?.bankName)} />
          <InfoItem label="Số tài khoản" value={displayText(employee?.bankAccountNumber)} />
          <InfoItem label="Chủ tài khoản" value={displayText(employee?.bankAccountName)} />
          <div className="col-span-3 tablet:col-span-2 mobile:col-span-1">
            <InfoItem label="Địa chỉ thường trú" value={displayText(employee?.permanentAddress)} />
          </div>
          <div className="col-span-3 tablet:col-span-2 mobile:col-span-1">
            <InfoItem label="Địa chỉ hiện tại" value={displayText(employee?.currentAddress)} />
          </div>
          <div className="col-span-3 tablet:col-span-2 mobile:col-span-1">
            <InfoItem label="Ghi chú" value={displayText(employee?.note)} />
          </div>
        </div>

        {(employee?.contractFileName || employee?.contractFilePath) && (
          <div className="mt-16 flex items-center justify-between rounded-radius-m bg-secondary-50 px-12 py-8">
            <div className="min-w-0">
              <TextBase classNames="body3 !text-color-600" text="Hợp đồng lao động" />
              <div className="truncate text-13 font-semibold text-secondary-700">
                {getContractFileName(employee)}
              </div>
            </div>
            <div className="flex shrink-0 gap-8">
              <IconHover
                rootClassName="text-color-800"
                title="Xem hợp đồng"
                icon="ICON_EYE_OPEN"
                iconHeight={K_SIZE_18}
                onClick={onViewContractFile}
              />
              <IconHover
                rootClassName="text-color-800"
                title="Tải hợp đồng"
                icon="IC_DOWNLOAD_OUTLINE"
                iconHeight={K_SIZE_18}
                onClick={onDownloadContractFile}
              />
            </div>
          </div>
        )}
      </section>
    </div>
  );

  return (
    <PageWithBreadcrumb>
      <div>
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
            <TextBase classNames="title4 !uppercase !text-primary-900" text="Chi tiết nhân sự" />
          </div>
          <ButtonBase
            type="ghost"
            leftIcon="ICON_EDIT"
            customContent="Sửa thông tin"
            onClick={onEdit}
            disabled={!employee?.id}
            classNames="mobile:w-full mobile:justify-center"
          />
        </Flex>
        <Divider className="my-16" />

        <Spin spinning={detailLoading}>
          <Tabs
            items={[
              {
                key: 'general',
                label: 'Thông tin chung',
                children: commonInfo
              },
              {
                key: 'salary-history',
                label: 'Lịch sử tăng lương',
                children: (
                  <div className="overflow-hidden rounded-radius-l border border-color-400 pb-4">
                    <AppTable
                      rootClassName="w-full"
                      className="[&_.ant-pagination]:hidden"
                      scroll={{ x: 'max-content' }}
                      dataSource={sortedSalaryHistory}
                      columns={salaryColumns}
                      rowKey="id"
                      pagination={false}
                    />
                  </div>
                )
              }
            ]}
          />
        </Spin>
      </div>
    </PageWithBreadcrumb>
  );
};

export default ManageEmployeeDetailScreen;
