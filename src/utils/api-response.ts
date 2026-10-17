import { ErrorBase } from 'model/common';

const SUCCESS_MESSAGES = ['success', 'ok'];
const SUCCESS_CODE_STATUSES = [
  ...SUCCESS_MESSAGES,
  '0',
  '00',
  '000',
  '0000',
  '00000',
  '000000',
  '200',
  '201',
  '204'
];

const normalizeApiText = (value?: unknown) =>
  String(value || '')
    .trim()
    .toLowerCase();

const isSuccessMessage = (message?: unknown) =>
  SUCCESS_MESSAGES.includes(normalizeApiText(message));

export const hasApiError = (
  response?: ErrorBase & {
    codeStatus?: string;
    error?: unknown;
    status?: number;
    statusCode?: number;
  }
) => {
  if (!response || response instanceof Error) return true;

  const status = Number(response.status ?? response.statusCode);
  const normalizedCodeStatus = normalizeApiText(response.codeStatus);
  const hasResponseError = Boolean(
    response.businessErrorMessage ||
      response.systemErrorMessage ||
      response.detailMessage ||
      response.error
  );

  if ((Number.isFinite(status) && status >= 400) || hasResponseError) return true;
  if (normalizedCodeStatus) {
    return (
      !SUCCESS_CODE_STATUSES.includes(normalizedCodeStatus) &&
      !/^2\d{2}$/.test(normalizedCodeStatus)
    );
  }
  if (isSuccessMessage(response.message)) return false;
  if (Number.isFinite(status) && status >= 200 && status < 300) return false;

  // Network failures have a message but no HTTP status or API error code.
  return Boolean(normalizeApiText(response.message));
};
