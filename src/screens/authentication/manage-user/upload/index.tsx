'use client';

import {
  K_SIZE_1,
  K_SIZE_130,
  K_SIZE_16,
  K_SIZE_160,
  K_SIZE_200,
  K_SIZE_220,
  K_SIZE_24,
  K_SIZE_60,
  K_SIZE_8,
  NULL_VALUE
} from '@constant';
import { Divider, Flex, Upload } from 'antd';
import clsx from 'clsx';
import ButtonBase from 'components/button';
import { IconSvgLocal } from 'components/icon-vec-local';
import Status, { KIND_STATUS } from 'components/status';
import AppTable from 'components/table';
import AppPagination from 'components/table/pagination';
import { TextBase } from 'components/text';
import { UserUpload, UserUploadError } from 'model/user';
import { useCallback, useMemo } from 'react';
import useManageUserUpload from 'screens/authentication/manage-user/hooks/useManageUserUpload';
import {
  USER_STATUS_LABEL_MAP,
  USER_STATUS_TYPE_MAP
} from 'screens/authentication/manage-user/utils/constant';

const ManageUserUploadPage = () => {
  const {
    t,
    isError,
    isEmpty,
    userPaginated,
    loadingUserList,
    pagination,
    onUpload,
    onDownloadTemplate,
    onSubmit,
    onBack,
    loadingUserDetail
  } = useManageUserUpload();

  const renderColumn = useCallback(
    (text: string, user?: UserUpload, errorField?: keyof UserUploadError) => {
      if (!user || !errorField) return text || NULL_VALUE;
      const error = user?.[errorField];
      return <TextBase text={text || NULL_VALUE} classNames={clsx({ 'text-error-500': error })} />;
    },
    []
  );

  const columns: any = useMemo(
    () => [
      {
        title: t('common:order'),
        dataIndex: 'rowNumber',
        align: 'center',
        width: K_SIZE_60
      },
      {
        title: t('login_screen:username'),
        dataIndex: 'username',
        key: 'username',
        align: 'left',
        width: K_SIZE_160,
        render: (text: string, user: UserUpload) => renderColumn(text, user, 'usernameError')
      },
      {
        title: t('manage_user:fullname'),
        dataIndex: 'fullName',
        align: 'left',
        width: K_SIZE_220,
        render: (text: string) => renderColumn(text)
      },
      {
        title: t('manage_user:unit'),
        dataIndex: 'unitName',
        align: 'left',
        width: K_SIZE_220,
        render: (text: string, user: UserUpload) => renderColumn(text, user, 'unitError')
      },
      {
        title: t('manage_user:department'),
        dataIndex: 'departmentName',
        align: 'left',
        width: K_SIZE_220,
        render: (text: string, user: UserUpload) => renderColumn(text, user, 'departmentError')
      },
      {
        title: t('manage_user:role'),
        dataIndex: 'role',
        align: 'left',
        width: K_SIZE_200,
        render: (text: string, user: UserUpload) => renderColumn(text, user, 'roleError')
      },
      {
        title: t('common:status'),
        dataIndex: 'statusCode',
        align: 'left',
        width: K_SIZE_130,
        render: (status: string) => {
          return (
            <Status
              type={USER_STATUS_TYPE_MAP[status]}
              kind={KIND_STATUS.SECONDARY}
              content={t(USER_STATUS_LABEL_MAP[status])}
            />
          );
        }
      },
      {
        title: t('manage_user:phone'),
        dataIndex: 'phone',
        align: 'left',
        width: K_SIZE_160,
        render: (text: string) => renderColumn(text)
      },
      {
        title: t('manage_user:email'),
        dataIndex: 'email',
        align: 'left',
        width: K_SIZE_160,
        render: (text: string, user: UserUpload) => renderColumn(text, user, 'emailError')
      }
    ],
    [t, renderColumn]
  );

  return (
    <div className={clsx({ 'mb-[76px]': !isEmpty })}>
      <Flex
        justify={'space-between'}
        align={'center'}
        gap={K_SIZE_8}
        className={'tablet:flex-col tablet:items-start'}
      >
        <div className={'flex items-center gap-8'}>
          <IconSvgLocal
            classNames="cursor-pointer"
            name="ICON_ARROW_LINE_LEFT"
            height={K_SIZE_24}
            width={K_SIZE_24}
            onClick={onBack}
          />
          <TextBase classNames="title4" t18n={'manage_user:upload_user'} />
        </div>
        <Flex gap={K_SIZE_16} className={'mobile:w-full'}>
          <Upload
            accept=".xlsx,.xls"
            maxCount={K_SIZE_1}
            showUploadList={false}
            customRequest={onUpload}
          >
            <ButtonBase
              type={'ghost'}
              leftIcon={'IC_UPLOAD_OUTLINE'}
              customContent={t('common:upload_file')}
              classNames={'mobile:flex-1 mobile:justify-center'}
            />
          </Upload>
          <ButtonBase
            type={'primary'}
            leftIcon={'IC_DOWNLOAD_OUTLINE'}
            customContent={t('common:download_template')}
            onClick={onDownloadTemplate}
            classNames={'mobile:flex-1 mobile:justify-center'}
          />
        </Flex>
      </Flex>
      <Divider className={'my-16 '} />
      {isEmpty ? (
        <div className="flex h-[50vh] flex-col items-center justify-center gap-16">
          <IconSvgLocal name="ICON_EMPTY" width={K_SIZE_200} />
          <TextBase
            t18n="manage_user:empty_user_upload"
            classNames="leading-20 text-14 text-color-600"
          />
        </div>
      ) : (
        <>
          <TextBase
            classNames="mb-16"
            preset="title4"
            text={t(isError ? 'manage_user:invalid_user_list' : 'manage_user:valid_user_list')}
          />
          <div className={'overflow-hidden rounded-radius-l border border-color-400 pb-4'}>
            <AppTable
              rootClassName={'w-full'}
              className={'[&_.ant-pagination]:hidden'}
              scroll={{ x: 'max-content', y: '75vh' }}
              dataSource={userPaginated}
              loading={loadingUserList}
              columns={[...columns]}
              rowKey={'rowNumber'}
              pagination={pagination}
            />
          </div>
          <AppPagination
            currentPage={pagination.current}
            total={pagination.total}
            pagination={pagination}
          />
        </>
      )}
      {!isEmpty && (
        // eslint-disable-next-line tailwindcss/no-contradicting-classname
        <div className="fixed bottom-0 left-[254px] right-0 z-[9] bg-color-50 shadow-up-m shadow-[rgb(var(--color-black)/0.05)] tablet:left-0">
          <div className="flex justify-end gap-16 px-24 py-16">
            <ButtonBase
              classNames="app-common-btn flex justify-center items-center mobile:flex-1"
              type="ghost"
              customContent={t('common:close')}
              onClick={onBack}
            />
            <ButtonBase
              classNames="app-common-btn flex justify-center items-center mobile:flex-1"
              type="primary"
              customContent={t('common:confirm')}
              disabled={isEmpty || isError || loadingUserDetail}
              onClick={onSubmit}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUserUploadPage;
