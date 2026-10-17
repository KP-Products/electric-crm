/* eslint-disable import/no-cycle */
import { Skeleton, Table, type TableProps } from 'antd';
import type { AnyObject } from 'antd/es/_util/type';
import type { TableLocale } from 'antd/es/table/interface';
import { IconSvgLocal } from 'components/icon-vec-local';
import { TextBase } from 'components/text';
import { forwardRef, type ReactElement } from 'react';

export interface AppTableProps<T extends AnyObject = AnyObject>
  extends Omit<TableProps<T>, 'bordered'> {
  rounded?: boolean;
  loading?: boolean;
  emptyText?: string;
  emptyComponent?: React.ReactNode;
}

const AppTable = forwardRef(
  (
    {
      loading,
      emptyText,
      emptyComponent,
      rounded = false,
      size = 'small',
      pagination = false,
      ...restProps
    }: AppTableProps,
    ref: Parameters<typeof Table>[0]['ref']
  ) => {
    const locale: TableLocale = {
      ...restProps.locale,
      emptyText: (
        <Skeleton active loading={loading} paragraph={{ rows: 4 }} title={false}>
          {emptyComponent || <TextBase t18n={emptyText || 'common:no_data'} />}
        </Skeleton>
      )
    };

    return (
      <Table
        ref={ref}
        size={size}
        data-rounded={rounded}
        pagination={
          pagination && {
            ...pagination,
            position: ['bottomCenter'],
            hideOnSinglePage: true,
            prevIcon: (
              // eslint-disable-next-line tailwindcss/no-custom-classname
              <div className="ant-pagination-item-link">
                <IconSvgLocal
                  name="ICON_ARROW_LEFT"
                  height={20}
                  width={20}
                  fill="rgb(var(--color-600))"
                />
              </div>
            ),
            nextIcon: (
              // eslint-disable-next-line tailwindcss/no-custom-classname
              <div className="ant-pagination-item-link">
                <IconSvgLocal
                  name="ICON_ARROW_LEFT"
                  height={20}
                  width={20}
                  fill="rgb(var(--color-600))"
                />
              </div>
            )
          }
        }
        locale={locale}
        {...restProps}
      />
    );
  }
);

// Opt in to typed rows without changing inference for existing table consumers.
export const TypedAppTable = AppTable as <T extends AnyObject = AnyObject>(
  props: AppTableProps<T> & { ref?: Parameters<typeof Table>[0]['ref'] }
) => ReactElement;

export default AppTable;
