const THOUSAND_SEPARATOR = ',';
const DECIMAL_SEPARATOR = '.';

export const sanitizeIntegerInput = (value?: string | number | null) =>
  String(value ?? '').replace(/\D/g, '');

const normalizeIntegerDigits = (value: string) => value.replace(/^0+(?=\d)/, '');

const formatIntegerPart = (value: string) =>
  value.replace(/\B(?=(\d{3})+(?!\d))/g, THOUSAND_SEPARATOR);

export const formatIntegerWithCommas = (value?: string | number | null) => {
  const digits = normalizeIntegerDigits(sanitizeIntegerInput(value));
  if (!digits) return '';
  return formatIntegerPart(digits);
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

export const normalizeFormattedNumberInput = (value?: string | number | null) => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value) : '';
  }

  const compactValue = String(value ?? '')
    .trim()
    .replace(/\s/g, '')
    .replace(/[^\d,.-]/g, '');

  if (!compactValue) return '';

  const sign = compactValue.startsWith('-') ? '-' : '';
  const unsignedValue = compactValue.replace(/-/g, '');
  if (!unsignedValue) return '';

  const lastDotIndex = unsignedValue.lastIndexOf('.');
  const lastCommaIndex = unsignedValue.lastIndexOf(',');
  const hasDot = lastDotIndex !== -1;
  const hasComma = lastCommaIndex !== -1;

  if (hasDot && hasComma) {
    const decimalSeparator = lastDotIndex > lastCommaIndex ? '.' : ',';
    const decimalIndex = Math.max(lastDotIndex, lastCommaIndex);
    const integerPart = unsignedValue.slice(0, decimalIndex).replace(/[,.]/g, '') || '0';
    const decimalPart = unsignedValue.slice(decimalIndex + 1).replace(/[,.]/g, '');

    return `${sign}${integerPart}${
      unsignedValue.endsWith(decimalSeparator) || decimalPart
        ? `${DECIMAL_SEPARATOR}${decimalPart}`
        : ''
    }`;
  }

  if (hasComma) {
    if (/^\d{1,3}(?:,\d{3})+$/.test(unsignedValue)) {
      return `${sign}${unsignedValue.replace(/,/g, '')}`;
    }

    const parts = unsignedValue.split(',');
    const decimalPart = parts.pop() || '';
    const integerPart = parts.join('').replace(/[,.]/g, '') || '0';
    return `${sign}${integerPart}${DECIMAL_SEPARATOR}${decimalPart}`;
  }

  if (hasDot) {
    const dotCount = (unsignedValue.match(/\./g) || []).length;
    if (dotCount > 1 && /^\d{1,3}(?:\.\d{3})+$/.test(unsignedValue)) {
      return `${sign}${unsignedValue.replace(/\./g, '')}`;
    }

    const parts = unsignedValue.split('.');
    const decimalPart = parts.pop() || '';
    const integerPart = parts.join('').replace(/[,.]/g, '') || '0';
    return `${sign}${integerPart}${DECIMAL_SEPARATOR}${decimalPart}`;
  }

  return `${sign}${unsignedValue}`;
};

export const sanitizeDecimalInput = (
  value?: string | number | null,
  options: { allowNegative?: boolean } = {}
) => {
  const normalizedValue = normalizeFormattedNumberInput(value);
  if (!normalizedValue) return '';

  const sign =
    options.allowNegative && normalizedValue.startsWith('-') && normalizedValue !== '-' ? '-' : '';
  const unsignedValue = normalizedValue.replace(/-/g, '');
  const hasDecimalSeparator = unsignedValue.includes(DECIMAL_SEPARATOR);
  const [integerPart = '', ...decimalParts] = unsignedValue.split(DECIMAL_SEPARATOR);
  const decimalPart = decimalParts.join('');

  return `${sign}${integerPart}${hasDecimalSeparator ? `${DECIMAL_SEPARATOR}${decimalPart}` : ''}`;
};

export const formatDecimalWithCommas = (
  value?: string | number | null,
  options: { allowNegative?: boolean } = {}
) => {
  const normalizedValue = sanitizeDecimalInput(value, options);
  if (!normalizedValue) return '';

  const sign = normalizedValue.startsWith('-') ? '-' : '';
  const unsignedValue = normalizedValue.replace(/-/g, '');
  const hasDecimalSeparator = unsignedValue.includes(DECIMAL_SEPARATOR);
  const [integerPart = '', decimalPart = ''] = unsignedValue.split(DECIMAL_SEPARATOR);
  const digits = normalizeIntegerDigits(integerPart.replace(/\D/g, '')) || '0';

  return `${sign}${formatIntegerPart(digits)}${
    hasDecimalSeparator ? `${DECIMAL_SEPARATOR}${decimalPart}` : ''
  }`;
};

export const parseFormattedNumber = (value?: string | number | null) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;

  const normalizedValue = normalizeFormattedNumberInput(value);
  if (!normalizedValue || normalizedValue === '-' || normalizedValue === DECIMAL_SEPARATOR) {
    return undefined;
  }

  const parsed = Number(normalizedValue);
  return Number.isFinite(parsed) ? parsed : undefined;
};

// Controlled inputs already display en-US separators. Do not infer a new locale
// from partially edited groups (for example, typing 5 after "1,234").
export const formatDecimalInputWithCommas = (value?: string | number | null) => {
  const input = String(value ?? '').replace(/[^\d.]/g, '');
  if (!input) return '';

  const [integerPart, ...fractionParts] = input.split('.');
  const digits = normalizeIntegerDigits(integerPart) || '0';
  return `${formatIntegerPart(digits)}${
    fractionParts.length ? `${DECIMAL_SEPARATOR}${fractionParts.join('')}` : ''
  }`;
};

export const formatNumberValueWithCommas = (
  value?: string | number | null,
  options: Intl.NumberFormatOptions = {}
) => {
  const parsedValue = parseFormattedNumber(value);
  if (parsedValue === undefined) return '';

  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 3,
    ...options
  }).format(parsedValue);
};
