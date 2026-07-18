'use client';

import {
  K_SIZE_0,
  K_SIZE_1,
  K_SIZE_108,
  K_SIZE_130,
  K_SIZE_16,
  K_SIZE_160,
  K_SIZE_18,
  K_SIZE_200,
  K_SIZE_8,
  NULL_VALUE
} from '@constant';
import { Divider, Flex } from 'antd';
import clsx from 'clsx';
import ButtonBase from 'components/button';
import IconHover from 'components/icon-vec-local/icon-hover';
import Status, { KIND_STATUS } from 'components/status';
import AppTable from 'components/table';
import AppPagination from 'components/table/pagination';
import TagFilter from 'components/tag-filter';
import { TextBase } from 'components/text';
import { ROUTES } from 'config/routes';
import PageWithBreadcrumb from 'layout/AppLayout/PageWithBreadcumb';
import { Meter } from 'model/meter';
import { useCallback, useMemo } from 'react';
import { displayDateFromServer } from 'utils/date';
import useManageMeter, { MeterFilterForm } from './hooks/useManageMeter';
import {
  getInspectionStatus,
  getMeterRecordId,
  getMeterStatusLabel,
  getMeterStatusType,
  getMeterTypeLabel,
  getUsagePurposeLabel,
  getVoltageTypeLabel,
  INSPECTION_STATUS_LABEL_MAP,
  INSPECTION_STATUS_TYPE_MAP,
  METER_STATUS_LABEL_MAP,
  VOLTAGE_TYPE_LABEL_MAP
} from './utils/constant';

const renderText = (text?: string | number) =>
  text !== undefined && text !== null && text !== '' ? String(text) : NULL_VALUE;

const renderTruncatedText = (text?: string, className = 'max-w-[220px]') => (
  <div title={text} className={`${className} truncate`}>
    {text || NULL_VALUE}
  </div>
);

const renderDate = (date?: string) => (date ? displayDateFromServer(date) : NULL_VALUE);

const MeterManagementScreen = () => {
  const {
    t,
    router,
    filterApplied,
    loadingMeterList,
    exportLoading,
    currentPage,
    pagination,
    onResetFilter,
    meterList,
    total,
    onExport
  } = useManageMeter();

  const renderInspectionStatus = useCallback((inspectionExpiryDate?: string) => {
    const inspectionStatus = getInspectionStatus(inspectionExpiryDate);
    return (
      <Status
        type={INSPECTION_STATUS_TYPE_MAP[inspectionStatus]}
        kind={KIND_STATUS.SECONDARY}
        content={INSPECTION_STATUS_LABEL_MAP[inspectionStatus]}
      />
    );
  }, []);

  const columns = useMemo<any[]>(
    () => [
      {
        title: 'Số công tơ',
        dataIndex: 'meterCode',
        key: 'meterCode',
        align: 'left',
        width: K_SIZE_160,
        render: (text: string, record: Meter) => {
          const recordId = getMeterRecordId(record);
          return (
            <TextBase
              text={text || NULL_VALUE}
              classNames={'sub-title4 !text-secondary-500 cursor-pointer hover:!text-secondary-700'}
              onClick={() =>
                recordId && router.push(`${ROUTES.MANAGE_METER_DETAIL}?id=${recordId}`)
              }
            />
          );
        }
      },
      {
        title: 'Trạng thái',
        dataIndex: 'status',
        key: 'status',
        align: 'left',
        width: K_SIZE_130,
        render: (status: string) => (
          <Status
            type={getMeterStatusType(status)}
            kind={KIND_STATUS.SECONDARY}
            content={getMeterStatusLabel(status)}
          />
        )
      },
      {
        title: 'Loại công tơ',
        dataIndex: 'meterType',
        key: 'meterType',
        align: 'left',
        width: K_SIZE_130,
        render: getMeterTypeLabel
      },
      {
        title: 'Ngày mua',
        dataIndex: 'purchaseDate',
        key: 'purchaseDate',
        align: 'left',
        width: K_SIZE_130,
        render: renderDate
      },
      {
        title: 'Ngày lắp',
        dataIndex: 'installationDate',
        key: 'installationDate',
        align: 'left',
        width: K_SIZE_130,
        render: renderDate
      },
      {
        title: 'Ngày kiểm định',
        dataIndex: 'inspectionDate',
        key: 'inspectionDate',
        align: 'left',
        width: K_SIZE_130,
        render: renderDate
      },
      {
        title: 'Thời hạn kiểm định',
        dataIndex: 'inspectionExpiryDate',
        key: 'inspectionExpiryDate',
        align: 'left',
        width: K_SIZE_160,
        render: renderDate
      },
      {
        title: 'Cảnh báo',
        dataIndex: 'inspectionExpiryDate',
        key: 'inspectionStatus',
        align: 'left',
        width: K_SIZE_160,
        render: renderInspectionStatus
      },
      {
        title: 'Cấp điện áp',
        dataIndex: 'voltageType',
        key: 'voltageType',
        align: 'left',
        width: K_SIZE_130,
        render: (_: string, record: Meter) =>
          getVoltageTypeLabel(record.voltageType || record.voltageLevel)
      },
      {
        title: 'Khách hàng',
        dataIndex: 'customerId',
        key: 'customerId',
        align: 'left',
        width: K_SIZE_200,
        render: (_: string, record: Meter) =>
          renderTruncatedText(record.customerName || record.customerId, 'max-w-[220px]')
      },
      {
        title: 'Lộ điện',
        dataIndex: 'feederId',
        key: 'feederId',
        align: 'left',
        width: K_SIZE_200,
        render: (_: string, record: Meter) =>
          renderTruncatedText(record.feederName || record.feederId, 'max-w-[220px]')
      },
      {
        title: 'Mục đích',
        dataIndex: 'usagePurpose',
        key: 'usagePurpose',
        align: 'left',
        width: K_SIZE_160,
        render: getUsagePurposeLabel
      },
      {
        title: 'Hệ số nhân',
        dataIndex: 'multiplier',
        key: 'multiplier',
        align: 'right',
        width: K_SIZE_130,
        render: renderText
      },
      {
        title: t('common:action'),
        fixed: 'right',
        width: K_SIZE_108,
        align: 'center',
        render: (_: unknown, record: Meter) => {
          const recordId = getMeterRecordId(record);
          return (
            <div className="flex justify-center">
              <IconHover
                rootClassName={'text-color-800'}
                title={t('common:edit')}
                icon={'ICON_EDIT'}
                iconHeight={K_SIZE_18}
                onClick={() =>
                  recordId && router.push(`${ROUTES.MANAGE_METER_EDIT}?id=${recordId}`)
                }
              />
            </div>
          );
        }
      }
    ],
    [renderInspectionStatus, router, t]
  );

  const TagFilterGroup = useCallback(() => {
    const entries = Object.entries(filterApplied) as [keyof MeterFilterForm, string][];
    const activeFilters = entries.filter(([, value]) => Boolean(value));
    const formatValue = (key: keyof MeterFilterForm, value: string) => {
      switch (key) {
        case 'status':
          return METER_STATUS_LABEL_MAP[value] || value;
        case 'voltageType':
          return VOLTAGE_TYPE_LABEL_MAP[value] || value;
        default:
          return value;
      }
    };
    const labelMap: Record<keyof MeterFilterForm, string> = {
      meterCodeContains: 'Số công tơ',
      customerId: 'Khách hàng',
      voltageType: 'Cấp điện áp',
      status: 'Trạng thái'
    };
    return (
      <div
        className={clsx('flex w-full flex-wrap items-center gap-8', {
          'mb-8': activeFilters.length > K_SIZE_0
        })}
      >
        {activeFilters.map(([key, value]) => {
          const valueFilter = formatValue(key, value);
          if (!valueFilter) return null;
          return (
            <TagFilter
              key={key}
              content={`${labelMap[key]}: ${valueFilter}`}
              onClose={() => onResetFilter(key)}
            />
          );
        })}
      </div>
    );
  }, [filterApplied, onResetFilter]);

  const breadcrumbList = [
    {
      title: t('menu:system_administration')
    },
    {
      title: 'Quản lý công tơ',
      key: ROUTES.METER_MANAGEMENT
    }
  ];

  return (
    <PageWithBreadcrumb breadcrumbList={breadcrumbList}>
      <div>
        <Flex
          justify={'space-between'}
          align={'center'}
          gap={K_SIZE_8}
          className={'tablet:flex-col tablet:items-start'}
        >
          <div>
            <TextBase classNames="title4" text={'Quản lý công tơ'} />
            <TextBase
              classNames="body3 !text-color-700"
              text={`Theo dõi ${total} công tơ điện tử/cơ, ngày kiểm định và trạng thái lắp đặt`}
            />
          </div>
          <Flex
            flex={K_SIZE_1}
            justify={'end'}
            gap={K_SIZE_16}
            className={'mobile:w-full mobile:flex-col'}
          >
            <ButtonBase
              type={'ghost'}
              leftIcon={'IC_DOWNLOAD_OUTLINE'}
              customContent={exportLoading ? 'Đang xuất...' : 'Xuất Excel'}
              disabled={exportLoading}
              classNames={'mobile:flex-1 mobile:justify-center'}
              onClick={onExport}
            />
            <ButtonBase
              type={'ghost'}
              leftIcon={'IC_ADD_OUTLINE2'}
              customContent={t('common:add_new')}
              classNames={'mobile:flex-1 mobile:justify-center'}
              onClick={() => router.push(ROUTES.MANAGE_METER_ADD)}
            />
          </Flex>
        </Flex>
        <Divider className={'my-16 '} />
        <TagFilterGroup />
        <div className={'overflow-hidden rounded-radius-l border border-color-400 pb-4'}>
          <AppTable
            rootClassName={'w-full'}
            className={'[&_.ant-pagination]:hidden'}
            scroll={{ x: 'max-content', y: '75vh' }}
            dataSource={meterList}
            loading={loadingMeterList}
            columns={columns}
            rowKey={(record: any) => getMeterRecordId(record) || record.meterCode}
            pagination={pagination}
          />
        </div>
        <AppPagination currentPage={currentPage} total={total} pagination={pagination} />
      </div>
    </PageWithBreadcrumb>
  );
};

export default MeterManagementScreen;
