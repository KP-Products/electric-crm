'use client';

import {
  DEFAULT_PAGE_SIZE,
  K_SIZE_0,
  K_SIZE_1,
  K_SIZE_100,
  K_SIZE_120,
  K_SIZE_130,
  K_SIZE_140,
  K_SIZE_160,
  K_SIZE_18,
  K_SIZE_200,
  K_SIZE_220,
  K_SIZE_80,
  K_SIZE_8,
  NULL_VALUE
} from '@constant';
import { Avatar, Divider, Flex } from 'antd';
import ButtonBase from 'components/button';
import IconHover from 'components/icon-vec-local/icon-hover';
import { AppSelect } from 'components/select';
import Status, { KIND_STATUS } from 'components/status';
import AppTable from 'components/table';
import AppPagination from 'components/table/pagination';
import TagFilter from 'components/tag-filter';
import { TextBase } from 'components/text';
import { AppTextField } from 'components/text-field';
import PageWithBreadcrumb from 'layout/AppLayout/PageWithBreadcumb';
import { Employee } from 'model/employee';
import { useMemo } from 'react';
import { displayDateFromServer } from 'utils/date';
import useManageEmployees, { EmployeeFilterForm } from './useManageEmployees';
import {
  EMPLOYMENT_STATUS_OPTIONS,
  displayText,
  formatSalary,
  getEmployeeGenderLabel,
  getEmployeeInitials,
  getEmploymentStatusLabel,
  getEmploymentStatusType,
  getEmploymentTypeLabel
} from './utils';

const FILTER_LABEL_MAP: Record<keyof EmployeeFilterForm, string> = {
  employeeCode: 'Mã nhân sự',
  fullName: 'Họ và tên',
  employmentStatus: 'Trạng thái'
};

const getFilterDisplayValue = (key: keyof EmployeeFilterForm, value: string) => {
  if (key === 'employmentStatus') return getEmploymentStatusLabel(value);
  return value;
};

const getDirectAvatarSrc = (avatarUrl?: string) => {
  const normalizedUrl = avatarUrl?.trim();
  if (!normalizedUrl) return undefined;
  if (
    normalizedUrl.startsWith('http://') ||
    normalizedUrl.startsWith('https://') ||
    normalizedUrl.startsWith('blob:') ||
    normalizedUrl.startsWith('data:') ||
    normalizedUrl.startsWith('/')
  ) {
    return normalizedUrl;
  }
  return undefined;
};

const ManageEmployeeScreen = () => {
  const {
    employeeList,
    total,
    listLoading,
    currentPage,
    pagination,
    filter,
    filterApplied,
    avatarUrlMap,
    onChangeFilter,
    onApplyFilter,
    onResetFilter,
    onOpenCreate,
    onOpenDetail,
    onOpenUpdate,
    onDelete,
    onDownloadContractFile
  } = useManageEmployees();

  const activeFilters = useMemo(
    () =>
      (Object.entries(filterApplied) as [keyof EmployeeFilterForm, string][]).filter(([, value]) =>
        Boolean(value)
      ),
    [filterApplied]
  );

  const columns = useMemo<any[]>(
    () => [
      {
        title: 'STT',
        key: 'index',
        width: K_SIZE_80,
        align: 'center',
        render: (_: unknown, __: Employee, index: number) =>
          (currentPage - K_SIZE_1) * DEFAULT_PAGE_SIZE + index + K_SIZE_1
      },
      {
        title: 'Mã nhân sự',
        dataIndex: 'employeeCode',
        key: 'employeeCode',
        width: K_SIZE_130,
        render: (text: string, record: Employee) => (
          <TextBase
            text={displayText(text)}
            classNames="sub-title4 !text-secondary-500 cursor-pointer hover:!text-secondary-700"
            onClick={() => onOpenDetail(record)}
          />
        )
      },
      {
        title: 'Họ và tên',
        dataIndex: 'fullName',
        key: 'fullName',
        width: K_SIZE_220,
        render: (text: string, record: Employee) => (
          <div className="flex min-w-0 items-center gap-8">
            <Avatar
              size={32}
              src={avatarUrlMap[record.id] || getDirectAvatarSrc(record.avatarUrl)}
              className="shrink-0 bg-primary-100 text-primary-700"
            >
              {getEmployeeInitials(record)}
            </Avatar>
            <button
              type="button"
              className="min-w-0 cursor-pointer truncate text-left text-14 font-semibold text-color-900 hover:text-secondary-700"
              onClick={() => onOpenDetail(record)}
              title={text}
            >
              {displayText(text)}
            </button>
          </div>
        )
      },
      {
        title: 'Giới tính',
        dataIndex: 'gender',
        key: 'gender',
        width: K_SIZE_100,
        render: (text: string) => displayText(getEmployeeGenderLabel(text))
      },
      {
        title: 'Ngày sinh',
        dataIndex: 'dateOfBirth',
        key: 'dateOfBirth',
        width: K_SIZE_120,
        render: (date: string) => displayDateFromServer(date)
      },
      {
        title: 'Phòng ban',
        dataIndex: 'departmentName',
        key: 'departmentName',
        width: K_SIZE_160,
        render: (text: string) => displayText(text)
      },
      {
        title: 'Chức vụ',
        dataIndex: 'positionName',
        key: 'positionName',
        width: K_SIZE_160,
        render: (text: string) => displayText(text)
      },
      {
        title: 'SĐT',
        dataIndex: 'phone',
        key: 'phone',
        width: K_SIZE_130,
        render: (text: string) => displayText(text)
      },
      {
        title: 'Email',
        dataIndex: 'email',
        key: 'email',
        width: K_SIZE_200,
        render: (text: string) => (
          <div title={text} className="max-w-[220px] truncate">
            {displayText(text)}
          </div>
        )
      },
      {
        title: 'Trạng thái',
        dataIndex: 'employmentStatus',
        key: 'employmentStatus',
        width: K_SIZE_140,
        render: (value: string) => (
          <Status
            type={getEmploymentStatusType(value)}
            kind={KIND_STATUS.SECONDARY}
            content={displayText(getEmploymentStatusLabel(value))}
          />
        )
      },
      {
        title: 'Loại nhân sự',
        dataIndex: 'employmentType',
        key: 'employmentType',
        width: K_SIZE_130,
        render: (value: string) => displayText(getEmploymentTypeLabel(value))
      },
      {
        title: 'Lương cơ bản',
        dataIndex: 'basicSalary',
        key: 'basicSalary',
        width: K_SIZE_140,
        align: 'right',
        render: (value: number) => formatSalary(value)
      },
      {
        title: 'Thao tác',
        fixed: 'right',
        width: K_SIZE_140,
        align: 'center',
        render: (_: unknown, record: Employee) => (
          <div className="flex justify-center gap-8">
            <IconHover
              rootClassName="text-color-800"
              title="Xem chi tiết"
              icon="ICON_EYE_OPEN"
              iconHeight={K_SIZE_18}
              onClick={() => onOpenDetail(record)}
            />
            <IconHover
              rootClassName="text-color-800"
              title="Sửa"
              icon="ICON_EDIT"
              iconHeight={K_SIZE_18}
              onClick={() => onOpenUpdate(record)}
            />
            <IconHover
              rootClassName="text-color-800"
              title="Tải hợp đồng"
              icon="IC_DOWNLOAD_OUTLINE"
              iconHeight={K_SIZE_18}
              onClick={() => onDownloadContractFile(record)}
            />
            <IconHover
              rootClassName="text-error-500 hover:text-error-500"
              title="Xoá"
              icon="IC_TRASH_OUTLINE"
              iconHeight={K_SIZE_18}
              onClick={() => onDelete(record)}
            />
          </div>
        )
      }
    ],
    [avatarUrlMap, currentPage, onDelete, onDownloadContractFile, onOpenDetail, onOpenUpdate]
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
          <TextBase classNames="title4 !uppercase !text-primary-900" text="Danh sách nhân sự" />
          <ButtonBase
            type="primary"
            leftIcon="IC_ADD_OUTLINE2"
            customContent="Thêm nhân sự"
            onClick={onOpenCreate}
            classNames="mobile:w-full mobile:justify-center"
          />
        </Flex>
        <Divider className="my-16" />

        <div className="mb-16 grid grid-cols-[minmax(160px,1fr)_minmax(160px,1fr)_minmax(150px,1fr)_auto] gap-12 tablet:grid-cols-2 mobile:grid-cols-1">
          <AppTextField
            name="employeeCode"
            label="Mã nhân sự"
            placeholder="Nhập mã nhân sự"
            value={filter.employeeCode}
            onChange={(event) => onChangeFilter('employeeCode', event.target.value)}
            onPressEnter={onApplyFilter}
          />
          <AppTextField
            name="fullName"
            label="Họ và tên"
            placeholder="Nhập họ và tên"
            value={filter.fullName}
            onChange={(event) => onChangeFilter('fullName', event.target.value)}
            onPressEnter={onApplyFilter}
          />
          <AppSelect
            name="employmentStatus"
            label="Trạng thái"
            value={filter.employmentStatus}
            options={EMPLOYMENT_STATUS_OPTIONS}
            onSelectOption={({ key }) => onChangeFilter('employmentStatus', String(key))}
          />
          <Flex gap={K_SIZE_8} className="self-end tablet:col-span-2 mobile:col-span-1">
            <ButtonBase
              type="ghost"
              customContent="Xoá bộ lọc"
              onClick={() => onResetFilter()}
              classNames="min-w-[112px] mobile:flex-1 mobile:justify-center"
            />
            <ButtonBase
              type="primary"
              leftIcon="IC_SEARCH_OUTLINE2"
              customContent="Tìm kiếm"
              onClick={onApplyFilter}
              classNames="min-w-[112px] mobile:flex-1 mobile:justify-center"
            />
          </Flex>
        </div>

        {activeFilters.length > K_SIZE_0 && (
          <div className="mb-8 flex w-full flex-wrap items-center gap-8">
            {activeFilters.map(([key, value]) => (
              <TagFilter
                key={key}
                content={`${FILTER_LABEL_MAP[key]}: ${getFilterDisplayValue(key, value)}`}
                onClose={() => onResetFilter(key)}
              />
            ))}
          </div>
        )}

        <div className="overflow-hidden rounded-radius-l border border-color-400 pb-4">
          <AppTable
            rootClassName="w-full"
            className="[&_.ant-pagination]:hidden"
            scroll={{ x: 'max-content', y: '75vh' }}
            dataSource={employeeList}
            loading={listLoading}
            columns={columns}
            rowKey="id"
            pagination={pagination}
            locale={{ emptyText: NULL_VALUE }}
          />
        </div>
        <AppPagination currentPage={currentPage} total={total} pagination={pagination} />
      </div>
    </PageWithBreadcrumb>
  );
};

export default ManageEmployeeScreen;
