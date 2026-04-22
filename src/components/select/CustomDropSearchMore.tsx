'use client';
import { DEFAULT_PAGE_SIZE, K_SIZE_0, K_SIZE_32, K_SIZE_46 } from '@constant';
import { Spin } from 'antd';
import ButtonBase from 'components/button';
import { TextBase } from 'components/text';
import { AppTextField } from 'components/text-field';
import React, { useEffect, useRef } from 'react';
import { useAppTranslation } from 'utils/i18n';

export interface CustomDropSearchMoreProps {
  menuInstance: React.ReactNode;
  searchValue: string;
  onChangeSearch: (value: string) => void;
  onMore: () => void;
  totalList: number;
  total: number;
  loading: boolean;
}
const CustomDropSearchMore = ({
  menuInstance,
  searchValue,
  onChangeSearch,
  onMore,
  totalList,
  total,
  loading
}: CustomDropSearchMoreProps) => {
  const { t } = useAppTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: Math.max(K_SIZE_0, totalList - DEFAULT_PAGE_SIZE) * K_SIZE_46,
        behavior: 'auto'
      });
    }
  }, [totalList]);

  return (
    <div
      // eslint-disable-next-line tailwindcss/no-contradicting-classname
      className={
        'flex flex-col overflow-hidden rounded-radius-m border border-color-200 bg-color-50 pb-4 shadow-down-m shadow-[rgb(var(--color-black)/0.05)]'
      }
    >
      <div className={'px-12 py-8'}>
        <AppTextField
          value={searchValue}
          defaultValue={searchValue}
          onChange={(e) => {
            onChangeSearch(e.target.value);
          }}
          placeholder={t('common:search_placeholder')}
        />
      </div>
      <Spin spinning={loading}>
        <div
          ref={scrollRef}
          className="max-h-[300px] overflow-auto [&_.ant-dropdown-menu-item-selected>div]:block [&_.ant-dropdown-menu]:shadow-none"
        >
          {React.cloneElement(menuInstance as React.ReactElement)}
          {total === K_SIZE_0 && (
            <div className={'flex justify-center p-12'}>
              <TextBase t18n={'common:no_data'} classNames={'!text-color-600'} />
            </div>
          )}
          {total > totalList && (
            <div className={'flex justify-center px-12 py-8'}>
              <ButtonBase
                t18n={'common:view_more'}
                classNames={'flex-1 justify-center'}
                size={K_SIZE_32}
                onClick={onMore}
              />
            </div>
          )}
        </div>
      </Spin>
    </div>
  );
};

export default CustomDropSearchMore;
