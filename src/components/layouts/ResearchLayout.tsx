import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { DEFAULT_PAGE_SIZE, K_SIZE_24 } from '@constant';
import { Divider } from 'antd';
import clsx from 'clsx';
import ButtonBase from 'components/button';
import { IconSvgLocal } from 'components/icon-vec-local';
import AppTable from 'components/table';
import AppPagination from 'components/table/pagination';
import { TextBase } from 'components/text';
import { useMemo, useState } from 'react';
import { useAppTranslation } from 'utils/i18n';
import { wrapColumnsWithEmptyDash } from 'utils/table';

interface ResearchLayoutProps {
  titlePage: string;
  searchRef: any;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  dataSource: any[];
  columns: any[];
  onClickExport: () => void;
  filterForm?: JSX.Element;
  onClickDeleteLookup?: () => void;
  onClickSearch?: () => void;
  onClickBack?: () => void;
  heightTable?: string;
  contentLeft?: JSX.Element;
  hideDownloadButton?: boolean;
  total?: number;
  loadingSearch?: boolean;
  permissions?: { canDownload?: boolean };
}

const ResearchLayout = ({
  titlePage,
  searchRef,
  currentPage,
  setCurrentPage,
  dataSource,
  columns,
  onClickExport,
  filterForm,
  onClickDeleteLookup,
  onClickSearch,
  onClickBack,
  heightTable = '50vh',
  contentLeft,
  hideDownloadButton,
  total,
  loadingSearch,
  permissions
}: ResearchLayoutProps) => {
  const { t } = useAppTranslation();

  const pagination = useMemo(
    () => ({
      current: currentPage,
      total: total ?? dataSource?.length,
      pageSize: DEFAULT_PAGE_SIZE,
      onChange: (page: number) => setCurrentPage(page),
      showSizeChanger: false
    }),
    [currentPage, dataSource?.length, setCurrentPage, total]
  );
  const [collapsed, setCollapsed] = useState(false);
  const tableColumns = useMemo(() => wrapColumnsWithEmptyDash(columns), [columns]);

  return (
    <>
      <div className="flex flex-col gap-16">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            {onClickBack && (
              <IconSvgLocal
                classNames="cursor-pointer"
                name="ICON_ARROW_LINE_LEFT"
                height={K_SIZE_24}
                width={K_SIZE_24}
                onClick={onClickBack}
              />
            )}
            <TextBase classNames="title4" text={titlePage} />
          </div>
          {searchRef.current &&
            !hideDownloadButton &&
            (![
              t('fee_lookup:customer_fee_collection_history'),
              t('fee_lookup:customer_expected_fee_schedule')
            ].includes(titlePage) ||
              permissions?.canDownload) && (
              <ButtonBase
                classNames="app-common-btn"
                type="primary"
                customContent={t('common:download')}
                leftIcon="IC_DOWNLOAD_OUTLINE"
                onClick={onClickExport}
              />
            )}
        </div>
        {!collapsed && <Divider className="my-0" />}
        {!collapsed && (
          <div className="flex flex-col gap-16">
            {filterForm}
            <div className="flex items-center justify-between">
              <div>{contentLeft}</div>
              <div className="flex items-center justify-end gap-16">
                <ButtonBase
                  classNames={'app-common-btn'}
                  type="ghost"
                  customContent={t('common:delete_lookup')}
                  leftIcon="IC_CLOSE_OUTLINE"
                  onClick={onClickDeleteLookup}
                />
                <ButtonBase
                  classNames={'app-common-btn'}
                  type="secondary"
                  customContent={t('menu:lookup')}
                  leftIcon="ICON_SEARCH"
                  onClick={onClickSearch}
                  disabled={loadingSearch}
                />
              </div>
            </div>
          </div>
        )}
        <div className="relative mb-16">
          <Divider className="my-0" />

          <div
            className={clsx(
              'absolute left-1/2 top-1/2 flex size-12 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center bg-primary-500 px-12 py-8',
              !collapsed ? '!-top-8 rounded-t-radius-s' : '!top-8 rounded-b-radius-s'
            )}
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <DownOutlined /> : <UpOutlined />}
          </div>
        </div>
      </div>
      {!searchRef.current ? (
        <div className="flex h-[50vh] flex-col items-center justify-center gap-16">
          <IconSvgLocal name="ICON_EMPTY" width={186} height={154} />
          <TextBase
            t18n="common:statement_display"
            classNames="leading-20 text-14 text-color-600"
          />
        </div>
      ) : (
        <>
          <div className={'overflow-hidden rounded-radius-l border border-color-400'}>
            <AppTable
              rootClassName={'w-full'}
              className={'[&_.ant-pagination]:hidden'}
              scroll={{ x: 'max-content', y: !collapsed ? heightTable : '75vh' }}
              pagination={pagination}
              dataSource={dataSource}
              columns={tableColumns}
              loading={loadingSearch}
            />
          </div>
          <AppPagination
            currentPage={currentPage}
            total={total ?? dataSource?.length}
            pagination={pagination}
          />
        </>
      )}
    </>
  );
};

export default ResearchLayout;
