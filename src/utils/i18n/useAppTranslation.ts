import { useTranslation } from 'react-i18next';
import type { I18nKeys } from './locales';

export type TypedT = (key: I18nKeys, options?: Record<string, unknown>) => string;

/**
 * useAppTranslation – bản useTranslation có gợi ý key i18n khi gõ t('...').
 * Dùng thay useTranslation khi cần autocomplete cho key từ vi.json.
 *
 * @example
 * const { t } = useAppTranslation();
 * t('menu:parameters');  // IDE gợi ý: common:save, menu:parameters, ...
 * t('common:display_records', { from: 1, total: 10 });
 */
export function useAppTranslation() {
  const { t, ...rest } = useTranslation();
  const typedT: TypedT = (key, options) => t(key, options as Record<string, unknown>);
  return { t: typedT, ...rest };
}
