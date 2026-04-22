/* eslint-disable @typescript-eslint/no-explicit-any */
import en from './source/en.json';
import vi from './source/vi.json';

export const resources = {
  en: { ...en },
  vi: { ...vi }
};

type TupleKeys<T extends Readonly<any>> = Extract<keyof T, string>;

/** Inner key path with dot (e.g. "frequency.daily") for i18next keySeparator */
type InnerPath<T> = T extends string
  ? never
  : T extends Readonly<Record<string, unknown>>
    ? {
        [K in TupleKeys<T>]: T[K] extends string ? K & string : `${K & string}.${InnerPath<T[K]>}`;
      }[TupleKeys<T>]
    : never;

/** Full i18n key: namespace:key (e.g. "common:save", "manage_code_fee_group:frequency.daily") */
export type I18nKeys = {
  [NS in TupleKeys<typeof vi>]: (typeof vi)[NS] extends string
    ? never
    : `${NS & string}:${InnerPath<(typeof vi)[NS]>}`;
}[TupleKeys<typeof vi>];

export type TextT18nKey = I18nKeys | (string & {});
