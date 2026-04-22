'use client';
import React from 'react';
import { useTranslation } from 'react-i18next';
import type { TextT18nKey } from 'utils/i18n';

interface TextProps {
  /** Key i18n (namespace:key). Gõ t18n=" để xem gợi ý từ vi.json (common:save, menu:parameters, ...) */
  t18n?: TextT18nKey;
  text?: string;
  preset?:
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'title1'
    | 'title2'
    | 'title3'
    | 'title4'
    | 'title5'
    | 'sub-title1'
    | 'sub-title2'
    | 'sub-title3'
    | 'sub-title4'
    | 'body1'
    | 'body2'
    | 'body3'
    | 'caption1'
    | 'caption2'
    | 'caption3';
  classNames?: string;
  onClick?: () => void;
  t18nOptions?: any;
  children?: React.ReactNode;
  style?: any;
}
export const TextBase = (props: TextProps) => {
  const { t18n, text, preset, classNames = '', t18nOptions, children, ...rest } = props;
  const [t] = useTranslation();
  const i18nText = t18n && t(t18n, t18nOptions);
  const content: any = i18nText || text || children;
  return (
    <div className={`${preset} ${classNames}`} {...rest}>
      {i18nText && text ? `${text} ${i18nText}` : content}
    </div>
  );
};
