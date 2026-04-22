'use client';

import { K_SIZE_16, K_SIZE_24, K_SIZE_8 } from '@constant';
import { Divider, Flex } from 'antd';
import { IconSvgLocal } from 'components/icon-vec-local';
import { TextBase } from 'components/text';

export interface LayoutListPageProps {
  contentRight?: React.ReactNode;
  onClickBack?: () => void;
  titlePage: string;
  children: React.ReactNode;
  contentBottom?: React.ReactNode;
}

const LayoutListPage = ({
  contentRight,
  titlePage,
  children,
  onClickBack,
  contentBottom
}: LayoutListPageProps) => {
  return (
    <>
      <Flex
        justify={'space-between'}
        align={'center'}
        gap={K_SIZE_8}
        className={'tablet:flex-col tablet:items-start'}
      >
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
        <Flex flex={1} justify={'end'} gap={K_SIZE_16} className={'mobile:w-full mobile:flex-col'}>
          {contentRight}
        </Flex>
      </Flex>
      <Divider className={'my-16'} />
      {children}
      {contentBottom && (
        <div className="fixed bottom-0 left-[254px] right-0 z-10 tablet:left-0">
          <div className="bg-color-50 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
            <div className="flex justify-end gap-16 py-16 pr-24">{contentBottom}</div>
          </div>
        </div>
      )}
    </>
  );
};

export default LayoutListPage;
