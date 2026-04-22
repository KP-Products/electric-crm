'use client';

import { K_SIZE_20, NULL_VALUE } from '@constant';
import { TreeSelect } from 'antd';
import { TreeSelectProps } from 'antd/lib';
import AppHelperText from 'components/helper-text';
import { IconSvgLocal } from 'components/icon-vec-local';
import { TextBase } from 'components/text';
import { useMemo } from 'react';
import { useAppTranslation } from 'utils/i18n';

export interface TreeNode {
  value: string;
  title: string;
  children?: TreeNode[];
  [key: string]: any;
}

interface Props {
  isView?: boolean;
  classNameIsView?: string;
  treeData?: TreeNode[];
  label?: string;
  labelClassName?: string;
  wrapClassName?: string;
  selectedValues?: any[];
  setSelectedValues?: (value: any[]) => void;
  error?: string;
}

const AppTreeSelect = ({
  isView = false,
  classNameIsView = '',
  treeData = [],
  wrapClassName = '',
  label,
  labelClassName = '',
  selectedValues = [],
  setSelectedValues,
  error,
  ...restProps
}: Props & TreeSelectProps) => {
  const { t } = useAppTranslation();

  const valueMap = useMemo(() => {
    const map: Record<string, TreeNode> = {};

    const loop = (nodes: TreeNode[]) => {
      nodes.forEach((node) => {
        map[node.value] = node;
        if (node.children?.length) loop(node.children);
      });
    };

    loop(treeData);
    return map;
  }, [treeData]);

  const normalizedValues = useMemo(() => {
    return selectedValues?.map((item: any) => (typeof item === 'string' ? item : item?.value));
  }, [selectedValues]);

  return (
    <div className={`app-tree w-full ${wrapClassName}`}>
      <TextBase
        classNames={`mb-4 inline-flex flex-row items-center text-14 font-semibold leading-24 text-color-900 ${labelClassName}`}
      >
        {label}
      </TextBase>

      {isView ? (
        <div className={`flex flex-col gap-4 ${classNameIsView}`}>
          {!normalizedValues?.length
            ? NULL_VALUE
            : normalizedValues.map((value, index) => (
                <TextBase
                  key={index}
                  classNames="self-start rounded-[4px] bg-[rgba(0,0,0,0.06)] px-8 py-0 leading-[22px]"
                >
                  {valueMap[value]?.title}
                </TextBase>
              ))}
        </div>
      ) : (
        <TreeSelect
          className={`w-full ${error && 'tree-select-error'}`}
          placeholder={t('common:please_select')}
          allowClear
          multiple
          treeDefaultExpandAll
          treeData={treeData}
          treeCheckable
          value={selectedValues}
          onChange={(val: any) => {
            setSelectedValues?.(val || []);
          }}
          suffixIcon={
            <IconSvgLocal
              height={K_SIZE_20}
              name="ICON_DROP_DOWN"
              fill="rgb(var(--color-900))"
              classNames="-mr-4"
            />
          }
          {...restProps}
        />
      )}
      <AppHelperText error={error} />
    </div>
  );
};

export default AppTreeSelect;
