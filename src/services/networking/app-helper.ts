import { ApiResponse } from 'model/common';
import { appCodes } from 'utils/constant/appCodes';

/** Mã `codeStatus` của envelope thành công phía BE: { timestamp, codeStatus, message, data }. */
const SUCCESS_CODE_STATUS = '0';
const HTTP_ERROR_FROM = 400;

/**
 * BE đặt message riêng cho từng nghiệp vụ ("OK", "Cập nhật ... thành công"), chỉ `codeStatus` mới
 * là mã máy đọc được. Trước đây hàm này so message với 'Success' nên mọi API có message tiếng Việt
 * đều bị coi là lỗi — màn hình trắng dù API trả đủ dữ liệu.
 */
export const isSuccess = (response: ApiResponse) => {
  if (!response) return false;

  // Lỗi đi qua interceptor luôn kèm status HTTP và businessErrorMessage/systemErrorMessage.
  const { status } = response as ApiResponse & { status?: number };
  if (Number.isFinite(Number(status)) && Number(status) >= HTTP_ERROR_FROM) return false;
  if (response.businessErrorMessage || response.systemErrorMessage) return false;

  if (response.codeStatus !== undefined && response.codeStatus !== null) {
    return String(response.codeStatus) === SUCCESS_CODE_STATUS;
  }

  // Giữ tương thích với các API cũ chỉ trả message 'Success', không có codeStatus.
  return response?.message?.toLowerCase() === appCodes.SUCCESS.toLowerCase();
};
