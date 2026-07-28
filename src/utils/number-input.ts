const THOUSAND_SEPARATOR = ',';

export const sanitizeIntegerInput = (value?: string | number | null) =>
  String(value ?? '').replace(/\D/g, '');

const normalizeIntegerDigits = (value: string) => value.replace(/^0+(?=\d)/, '');

export const formatIntegerWithCommas = (value?: string | number | null) => {
  const digits = normalizeIntegerDigits(sanitizeIntegerInput(value));
  if (!digits) return '';
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, THOUSAND_SEPARATOR);
};

export const parseFormattedIntegerNumber = (value?: string | number | null) => {
  const digits = sanitizeIntegerInput(value);
  if (!digits) return undefined;

  const parsed = Number(digits);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export const isIntegerInput = (value?: string | number | null) => {
  const normalizedValue = String(value ?? '').trim();
  return !normalizedValue || /^\d+$/.test(normalizedValue);
};

export const isFormattedIntegerInput = (value?: string | number | null) => {
  const normalizedValue = String(value ?? '').trim();
  return (
    !normalizedValue ||
    /^\d+$/.test(normalizedValue) ||
    /^\d{1,3}(?:,\d{3})+$/.test(normalizedValue)
  );
};
