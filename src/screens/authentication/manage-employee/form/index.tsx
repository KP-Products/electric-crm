'use client';

import { K_SIZE_24, K_SIZE_8, REQUIRED_MARK } from '@constant';
import { Avatar, Divider, Flex, Spin, Upload } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import clsx from 'clsx';
import ButtonBase from 'components/button';
import { AppDatePickerControl } from 'components/date-picker';
import { IconSvgLocal } from 'components/icon-vec-local';
import { AppSelectControl } from 'components/select';
import CustomDropSearchMore from 'components/select/CustomDropSearchMore';
import { AppTakeNoteControl } from 'components/take-note';
import { TextBase } from 'components/text';
import { AppTextFieldControl } from 'components/text-field';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import PageWithBreadcrumb from 'layout/AppLayout/PageWithBreadcumb';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import employeeServices from 'services/employee-services';
import { canViewBlobInline, getBlobResponseError, isBlobFileResponse } from 'utils/blob-response';
import { getUploadFileSizeError, MAX_UPLOAD_FILE_SIZE_TEXT } from 'utils/upload';
import useManageEmployeeForm from '../hooks/useManageEmployeeForm';
import {
  EMPLOYEE_GENDER_OPTIONS,
  EMPLOYMENT_STATUS_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
  INLINE_AVATAR_MIME_TYPES,
  MAX_AVATAR_FILE_SIZE,
  MAX_CONTRACT_FILE_SIZE,
  getContractFileName,
  getEmployeeInitials,
  isAcceptedAvatarFile
} from '../utils';

const requiredMark = <span className="text-error-600">{REQUIRED_MARK}</span>;

interface ManageEmployeeFormScreenProps {
  isEditMode: boolean;
}

const ManageEmployeeFormScreen = ({ isEditMode }: ManageEmployeeFormScreenProps) => {
  const {
    dateApiFormat,
    form,
    detailLoading,
    selectedEmployee,
    selectedAvatar,
    selectedContractFile,
    managerOptions,
    managerSearch,
    managerOptionsLoading,
    setSelectedAvatar,
    setSelectedContractFile,
    onSearchManagers,
    onOpenManagerDropdown,
    submitLocked,
    onBack,
    onSubmit
  } = useManageEmployeeForm({ isEditMode });
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState('');

  const {
    control,
    handleSubmit,
    formState: { isSubmitting }
  } = form;

  useEffect(() => {
    let objectUrl = '';
    let disposed = false;

    if (selectedAvatar) {
      objectUrl = URL.createObjectURL(selectedAvatar);
      setAvatarPreviewUrl(objectUrl);
      return () => {
        disposed = true;
        if (objectUrl) URL.revokeObjectURL(objectUrl);
      };
    }

    setAvatarPreviewUrl('');

    if (!selectedEmployee?.id || !selectedEmployee.avatarUrl) {
      return;
    }

    employeeServices.viewEmployeeAvatar(selectedEmployee.id).then(async (response) => {
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
  }, [selectedAvatar, selectedEmployee?.avatarUrl, selectedEmployee?.id]);

  const contractFileList = useMemo<UploadFile[]>(() => {
    if (!selectedContractFile) return [];
    return [
      {
        uid: 'selected-employee-contract-file',
        name: selectedContractFile.name,
        status: 'done',
        size: selectedContractFile.size
      }
    ];
  }, [selectedContractFile]);

  const genderOptions = useMemo(
    () => EMPLOYEE_GENDER_OPTIONS.filter((option) => option.value !== ''),
    []
  );
  const statusOptions = useMemo(
    () => EMPLOYMENT_STATUS_OPTIONS.filter((option) => option.value !== ''),
    []
  );
  const typeOptions = useMemo(
    () => EMPLOYMENT_TYPE_OPTIONS.filter((option) => option.value !== ''),
    []
  );
  const renderManagerDropdown = (menuInstance: ReactNode) => (
    <CustomDropSearchMore
      menuInstance={menuInstance}
      searchValue={managerSearch}
      onChangeSearch={onSearchManagers}
      onMore={() => {}}
      totalList={managerOptions.length}
      total={managerOptions.length}
      loading={managerOptionsLoading}
    />
  );

  const title = isEditMode ? 'Cập nhật nhân sự' : 'Thêm nhân sự';
  const existingContractFileName = getContractFileName(selectedEmployee);

  return (
    <PageWithBreadcrumb
      breadcrumbList={[{ title: 'Quản lý nhân sự' }, { title: 'Danh sách nhân sự' }, { title }]}
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
            <TextBase classNames="title4 !text-primary-900" text={title} />
          </div>
        </Flex>
        <Divider className="my-16" />

        <Spin spinning={detailLoading && isEditMode}>
          <div className="grid grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)] gap-16 tablet:grid-cols-1">
            <section className="rounded-radius-l border border-color-300 bg-color-50 p-16">
              <TextBase
                classNames="sub-title3 mb-16 !text-primary-700"
                text="1. THÔNG TIN CÁ NHÂN"
              />
              <div className="grid grid-cols-2 gap-12 mobile:grid-cols-1">
                <AppTextFieldControl
                  name="employeeCode"
                  label="Mã nhân sự"
                  labelSuffix={requiredMark}
                  placeholder="Nhập mã nhân sự"
                  control={control}
                  disabled={isEditMode}
                />
                <AppTextFieldControl
                  name="fullName"
                  label="Họ và tên"
                  labelSuffix={requiredMark}
                  placeholder="Nhập họ và tên"
                  control={control}
                />
                <AppSelectControl
                  name="gender"
                  label="Giới tính"
                  placeholder="Chọn giới tính"
                  options={genderOptions}
                  control={control}
                />
                <AppDatePickerControl
                  name="dateOfBirth"
                  label="Ngày sinh"
                  placeholder="Chọn ngày sinh"
                  control={control}
                  backendFormat={dateApiFormat}
                  allowClear
                  wrapperClassName="w-full"
                  datePickerClassName="w-full"
                />
                <AppTextFieldControl
                  name="phone"
                  label="SĐT"
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
                  name="identityNumber"
                  label="Số CCCD/CMND"
                  placeholder="Nhập số CCCD/CMND"
                  control={control}
                />
                <AppDatePickerControl
                  name="identityIssueDate"
                  label="Ngày cấp"
                  placeholder="Chọn ngày cấp"
                  control={control}
                  backendFormat={dateApiFormat}
                  allowClear
                  wrapperClassName="w-full"
                  datePickerClassName="w-full"
                />
                <div className="col-span-2 mobile:col-span-1">
                  <AppTextFieldControl
                    name="identityIssuePlace"
                    label="Nơi cấp"
                    placeholder="Nhập nơi cấp"
                    control={control}
                  />
                </div>
                <AppTextFieldControl
                  name="taxCode"
                  label="Mã số thuế"
                  placeholder="Nhập mã số thuế"
                  control={control}
                />
                <AppTextFieldControl
                  name="socialInsuranceNo"
                  label="Số BHXH"
                  placeholder="Nhập số BHXH"
                  control={control}
                />
                <div className="col-span-2 mobile:col-span-1">
                  <AppTextFieldControl
                    name="permanentAddress"
                    label="Địa chỉ thường trú"
                    placeholder="Nhập địa chỉ thường trú"
                    control={control}
                  />
                </div>
                <div className="col-span-2 mobile:col-span-1">
                  <AppTextFieldControl
                    name="currentAddress"
                    label="Địa chỉ hiện tại"
                    placeholder="Nhập địa chỉ hiện tại"
                    control={control}
                  />
                </div>
              </div>
            </section>

            <div className="flex flex-col gap-16">
              <section className="rounded-radius-l border border-color-300 bg-color-50 p-16">
                <TextBase
                  classNames="sub-title3 mb-16 !text-primary-700"
                  text="2. THÔNG TIN CÔNG VIỆC"
                />
                <div className="grid grid-cols-2 gap-12 mobile:grid-cols-1">
                  <AppTextFieldControl
                    name="departmentName"
                    label="Phòng ban"
                    placeholder="Nhập tên phòng ban"
                    control={control}
                  />
                  <AppTextFieldControl
                    name="positionName"
                    label="Chức vụ"
                    placeholder="Nhập tên chức vụ"
                    control={control}
                  />
                  <AppSelectControl
                    name="managerId"
                    label="Quản lý trực tiếp"
                    placeholder="Chọn quản lý trực tiếp"
                    options={managerOptions}
                    dropdownRender={renderManagerDropdown}
                    onOpenChange={(open) => {
                      if (open) onOpenManagerDropdown();
                    }}
                    unSeleted
                    control={control}
                  />
                  <AppDatePickerControl
                    name="hireDate"
                    label="Ngày vào làm"
                    placeholder="Chọn ngày vào làm"
                    control={control}
                    backendFormat={dateApiFormat}
                    allowClear
                    wrapperClassName="w-full"
                    datePickerClassName="w-full"
                  />
                  <AppDatePickerControl
                    name="officialDate"
                    label="Ngày chính thức"
                    placeholder="Chọn ngày chính thức"
                    control={control}
                    backendFormat={dateApiFormat}
                    allowClear
                    wrapperClassName="w-full"
                    datePickerClassName="w-full"
                  />
                  <AppDatePickerControl
                    name="resignationDate"
                    label="Ngày nghỉ việc"
                    placeholder="Chọn ngày nghỉ việc"
                    control={control}
                    backendFormat={dateApiFormat}
                    allowClear
                    wrapperClassName="w-full"
                    datePickerClassName="w-full"
                  />
                  <AppSelectControl
                    name="employmentStatus"
                    label="Trạng thái"
                    options={statusOptions}
                    placeholder="Chọn trạng thái"
                    control={control}
                  />
                  <AppSelectControl
                    name="employmentType"
                    label="Loại nhân sự"
                    options={typeOptions}
                    placeholder="Chọn loại nhân sự"
                    control={control}
                  />
                  <AppTextFieldControl
                    name="basicSalary"
                    label="Lương cơ bản"
                    placeholder="Nhập lương cơ bản"
                    control={control}
                    formatNumberWithCommas
                  />
                  <AppTextFieldControl
                    name="qualifications"
                    label="Trình độ"
                    placeholder="Nhập trình độ"
                    control={control}
                  />
                </div>
              </section>

              <section className="rounded-radius-l border border-color-300 bg-color-50 p-16">
                <TextBase
                  classNames="sub-title3 mb-16 !text-primary-700"
                  text="3. HỒ SƠ & NGÂN HÀNG"
                />
                <div className="grid grid-cols-2 gap-12 mobile:grid-cols-1">
                  <div className="col-span-2 flex items-center gap-16 mobile:col-span-1">
                    <Avatar
                      size={72}
                      src={avatarPreviewUrl || undefined}
                      className="shrink-0 bg-primary-100 text-primary-700"
                    >
                      {getEmployeeInitials(selectedEmployee)}
                    </Avatar>
                    <div className="min-w-0">
                      <TextBase classNames="sub-title4 mb-4" text="Ảnh đại diện" />
                      <Upload
                        showUploadList={false}
                        beforeUpload={(file) => {
                          if (!isAcceptedAvatarFile(file)) {
                            showToast({
                              type: TYPE_TOAST.ERROR,
                              content: 'Ảnh đại diện chỉ hỗ trợ JPG, PNG'
                            });
                            return Upload.LIST_IGNORE;
                          }

                          if (file.size > MAX_AVATAR_FILE_SIZE) {
                            showToast({
                              type: TYPE_TOAST.ERROR,
                              content: getUploadFileSizeError('ảnh đại diện')
                            });
                            return Upload.LIST_IGNORE;
                          }
                          setSelectedAvatar(file);
                          return Upload.LIST_IGNORE;
                        }}
                      >
                        <ButtonBase type="ghost" customContent="Chọn ảnh" />
                      </Upload>
                    </div>
                  </div>
                  <AppTextFieldControl
                    name="bankName"
                    label="Ngân hàng"
                    placeholder="Nhập tên ngân hàng"
                    control={control}
                  />
                  <AppTextFieldControl
                    name="bankAccountNumber"
                    label="Số tài khoản"
                    placeholder="Nhập số tài khoản"
                    control={control}
                  />
                  <div className="col-span-2 mobile:col-span-1">
                    <AppTextFieldControl
                      name="bankAccountName"
                      label="Chủ tài khoản"
                      placeholder="Nhập chủ tài khoản"
                      control={control}
                    />
                  </div>
                  <div className="col-span-2 mobile:col-span-1">
                    <Upload.Dragger
                      fileList={contractFileList}
                      maxCount={1}
                      beforeUpload={(file) => {
                        if (file.size > MAX_CONTRACT_FILE_SIZE) {
                          showToast({
                            type: TYPE_TOAST.ERROR,
                            content: getUploadFileSizeError('hợp đồng')
                          });
                          return Upload.LIST_IGNORE;
                        }
                        setSelectedContractFile(file);
                        return Upload.LIST_IGNORE;
                      }}
                      onRemove={() => {
                        setSelectedContractFile(undefined);
                        return true;
                      }}
                      className="rounded-radius-l border-color-300 bg-color-50"
                    >
                      <div className="flex min-h-[120px] flex-col items-center justify-center gap-8 px-16 py-20">
                        <IconSvgLocal name="IC_UPLOAD_OUTLINE" height={28} width={28} />
                        <TextBase text="Kéo thả file hợp đồng hoặc chọn file" />
                        <TextBase
                          classNames="body3 !text-color-600"
                          text={`Tối đa ${MAX_UPLOAD_FILE_SIZE_TEXT}/file`}
                        />
                      </div>
                    </Upload.Dragger>
                    {isEditMode && selectedEmployee?.contractFileName && !selectedContractFile && (
                      <div className="mt-8 rounded-radius-m bg-secondary-50 px-12 py-8 text-13 text-secondary-700">
                        File hiện tại: {existingContractFileName}
                      </div>
                    )}
                  </div>
                  <div className="col-span-2 mobile:col-span-1">
                    <AppTakeNoteControl
                      name="note"
                      label="Ghi chú"
                      placeholder="Nhập ghi chú"
                      control={control}
                      autoSize={{ minRows: 3, maxRows: 5 }}
                    />
                  </div>
                </div>
              </section>
            </div>
          </div>
        </Spin>

        <div className="fixed bottom-0 left-[254px] right-0 z-[9] bg-color-50 tablet:left-0">
          <div className="flex justify-end gap-16 px-24 py-16">
            <ButtonBase
              classNames="app-common-btn flex justify-center items-center mobile:flex-1"
              type="ghost"
              customContent="Huỷ bỏ"
              onClick={onBack}
            />
            <ButtonBase
              classNames="app-common-btn flex justify-center items-center mobile:flex-1"
              type="primary"
              customContent="Lưu"
              disabled={submitLocked || detailLoading || isSubmitting}
              onClick={handleSubmit(onSubmit)}
            />
          </div>
        </div>
      </div>
    </PageWithBreadcrumb>
  );
};

export default ManageEmployeeFormScreen;
