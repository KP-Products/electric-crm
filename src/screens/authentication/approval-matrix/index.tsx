'use client';

import {
  K_SIZE_1,
  K_SIZE_100,
  K_SIZE_108,
  K_SIZE_18,
  K_SIZE_180,
  K_SIZE_220,
  K_SIZE_60,
  K_SIZE_8,
  NULL_VALUE
} from '@constant';
import { Divider, Flex } from 'antd';
import IconHover from 'components/icon-vec-local/icon-hover';
import AppTable from 'components/table';
import AppPagination from 'components/table/pagination';
import { TextBase } from 'components/text';
import { ROUTES } from 'config/routes';
import { Permission } from 'model/role';
import { useCallback, useMemo } from 'react';
import useApprovalMatrix from 'screens/authentication/approval-matrix/hooks/useApprovalMatrix';
import useApprovalMatrixPermission from 'screens/authentication/approval-matrix/hooks/useApprovalMatrixPermission';
import { displayDateTimeFromServer } from 'utils/date';

const ApprovalMatrix = () => {
  const { t, router, functionList, loadingFunctionList, pagination } = useApprovalMatrix();

  const { permission } = useApprovalMatrixPermission();

  const renderColumn = useCallback((text: string, display?: (text: string) => any) => {
    return display?.(text) || text || NULL_VALUE;
  }, []);

  const columns = useMemo(() => {
    const cols: any[] = [
      {
        title: t('common:order'),
        dataIndex: 'order',
        key: 'order',
        align: 'left',
        width: K_SIZE_60,
        render: (text: string, record: Permission, index: number) =>
          renderColumn(
            ((pagination.current - K_SIZE_1) * pagination.pageSize + index + K_SIZE_1).toString()
          )
      },
      {
        title: t('approval_matrix:approval_function'),
        dataIndex: 'actionSubGroupName',
        align: 'left',
        width: K_SIZE_220,
        render: (text: string, record: Permission) => {
          return (
            <TextBase
              text={text || record.action}
              classNames={'sub-title4 !text-secondary-500 cursor-pointer hover:!text-secondary-700'}
              onClick={() =>
                router.push(`${ROUTES.APPROVAL_MATRIX_DETAIL}?id=${record.permissionId}`)
              }
            />
          );
        }
      },
      {
        title: t('common:updated_at'),
        dataIndex: 'updatedAt',
        align: 'left',
        width: K_SIZE_180,
        render: (text: string) => renderColumn(text, displayDateTimeFromServer)
      },
      {
        title: t('common:updated_by'),
        dataIndex: 'updatedBy',
        align: 'left',
        width: K_SIZE_100,
        render: (text: string) => renderColumn(text)
      }
    ];
    if (!permission.canEdit) {
      cols.push({
        title: t('common:action'),
        fixed: 'right',
        width: K_SIZE_108,
        align: 'center',
        render: (_: any, record: Permission) => (
          <div className="flex justify-center">
            <IconHover
              rootClassName={'text-color-800'}
              title={t('common:edit')}
              icon={'ICON_EDIT'}
              iconHeight={K_SIZE_18}
              onClick={() =>
                router.push(`${ROUTES.APPROVAL_MATRIX_EDIT}?id=${record.id}`)
              }
            />
          </div>
        )
      });
    }
    return cols;
  }, [t, router, renderColumn, pagination, permission]);

  return (
    <div>
      <Flex
        justify={'space-between'}
        align={'center'}
        gap={K_SIZE_8}
        className={'min-h-44 tablet:flex-col tablet:items-start'}
      >
        <TextBase classNames="title4" t18n={'menu:approval_matrix'} />
      </Flex>
      <Divider className={'my-16 '} />
      <div className={'overflow-hidden rounded-radius-l border border-color-400 pb-4'}>
        <AppTable
          rootClassName={'w-full'}
          className={'[&_.ant-pagination]:hidden'}
          scroll={{ x: 'max-content', y: '75vh' }}
          dataSource={functionList}
          loading={loadingFunctionList}
          columns={[...columns]}
          rowKey={'permissionId'}
          pagination={pagination}
        />
      </div>
      <AppPagination
        currentPage={pagination.current}
        total={pagination.total}
        pagination={pagination}
      />
    </div>
  );
};

export default ApprovalMatrix;
