'use client';

import { DEFAULT_PAGE_SIZE, K_SIZE_0, K_SIZE_1 } from '@constant';
import { Pagination } from 'antd';
import { PaginationProps } from 'antd/es/pagination/Pagination';
import clsx from 'clsx';
import { TextBase } from 'components/text';
import { useMemo } from 'react';

interface Props {
  currentPage: number;
  total: number;
  pagination: PaginationProps;
  className?: string;
}
const AppPagination = ({ currentPage, total, pagination, className = '' }: Props) => {
  const { pageSize = DEFAULT_PAGE_SIZE } = pagination;
  const showingRange = useMemo(() => {
    const start = total ? (currentPage - K_SIZE_1) * pageSize + K_SIZE_1 : K_SIZE_0;
    const end = Math.min(currentPage * pageSize, total);
    return start === end ? start : `${start} - ${end}`;
  }, [currentPage, total, pageSize]);

  return (
    <div className={clsx('relative mt-20 flex w-full justify-center', className)}>
      <div
        className={
          'absolute inset-y-0 left-0 flex items-center duration-500 mobile:left-1/2 mobile:top-[56px] mobile:-translate-x-1/2'
        }
      >
        <TextBase
          t18n={'common:display_records'}
          t18nOptions={{
            from: showingRange,
            total: total
          }}
          classNames={'body2 !text-color-700'}
        />
      </div>
      <Pagination {...pagination} />
    </div>
  );
};

export default AppPagination;
