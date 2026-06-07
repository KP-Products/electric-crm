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
    <div
      className={clsx(
        'mt-20 grid w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-8 mobile:grid-cols-1 mobile:justify-items-center',
        className
      )}
    >
      <TextBase
        t18n={'common:display_records'}
        t18nOptions={{
          from: showingRange,
          total: total
        }}
        classNames={'body2 !text-color-700 justify-self-start mobile:justify-self-center'}
      />
      <Pagination className="justify-self-center" {...pagination} />
    </div>
  );
};

export default AppPagination;
