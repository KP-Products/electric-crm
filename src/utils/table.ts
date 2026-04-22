import { NULL_VALUE } from '@constant';
import { Table } from 'antd';
import type { AnyObject } from 'antd/es/_util/type';
import type { ColumnsType } from 'antd/es/table';

const isEmptyValue = (val: any) => val === null || val === undefined || val === '';

export const wrapColumnsWithEmptyDash = <T extends AnyObject = AnyObject>(
  columns: ColumnsType<T> = []
): ColumnsType<T> => {
  const normalize = (cols: ColumnsType<T>): ColumnsType<T> =>
    cols.map((col: any) => {
      if (col === Table.EXPAND_COLUMN || col === Table.SELECTION_COLUMN) return col;
      if (!col || typeof col !== 'object') return col;

      const hasChildren = Array.isArray(col.children) && col.children.length > 0;
      const originalRender = col.render;
      const isStructuralCol =
        hasChildren || (col?.dataIndex === undefined && !originalRender && !col?.key);

      if (isStructuralCol) {
        return hasChildren ? { ...col, children: normalize(col.children as ColumnsType<T>) } : col;
      }

      return {
        ...col,
        ...(hasChildren ? { children: normalize(col.children as ColumnsType<T>) } : {}),
        render: (value: any, record: T, index: number) => {
          const result = originalRender ? originalRender(value, record, index) : value;
          return isEmptyValue(result) ? NULL_VALUE : result;
        }
      };
    });

  return normalize(columns);
};
