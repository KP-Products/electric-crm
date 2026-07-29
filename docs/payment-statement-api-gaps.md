# API gaps — Nhập dữ liệu sao kê (SRS 6.1)

Frontend đã triển khai theo các endpoint hiện có. Các điểm dưới đây cần được chốt hoặc bổ sung để hoàn tất đúng nghiệp vụ SRS.

## 1. Upload lô: preview và xác nhận tách biệt

SRS yêu cầu người dùng xem tổng số dòng, số hợp lệ/không hợp lệ và lỗi theo từng dòng trước khi bấm **Xác nhận**.

`POST /admin/billing/payments/upload` hiện mô tả vừa validate vừa lưu dữ liệu khi mọi dòng hợp lệ. Đề nghị cung cấp một trong hai phương án:

- `POST /payments/upload/validate` trả `uploadToken`, thống kê và `rows[]`; sau đó `POST /payments/upload/confirm` nhận `uploadToken`; hoặc
- giữ `upload` là validate-only, thêm endpoint confirm riêng.

Schema preview tối thiểu:

```ts
{
  total: number;
  valid: number;
  invalid: number;
  fileError?: string;
  rows: Array<{
    rowNumber: number;
    periodCode?: string;
    invoiceNo?: string;
    customerCode?: string;
    customerName?: string;
    paymentAmount?: number;
    accountingDate?: string;
    transactionDate?: string;
    sourceAccount?: string;
    destinationAccount?: string;
    transactionNo?: string;
    description?: string;
    errors: string[];
  }>;
}
```

## 2. Định dạng file

SRS ghi nhận `.xls`, `.xlsx`; Swagger chỉ ghi `.xlsx`. Frontend hiện giới hạn `.xlsx`, phù hợp với Swagger và parser đang có. Nếu cần `.xls`, cần chốt thư viện/parser ở frontend và hỗ trợ tương ứng ở backend.

## 3. Danh sách thanh toán

- SRS có cột **Người tạo** nhưng `PaymentRowDto` chưa có `createdBy`/`createdByName`.
- SRS dùng kỳ `MM/YYYY`; ví dụ Swagger dùng `202607`. Cần xác nhận một format request/response duy nhất.
- `bills/search` được frontend gọi với `customerId` là string từ API customer; backend cần nhận kiểu này để trả đúng hóa đơn của khách hàng được chọn.
- SRS đánh dấu kỳ thanh toán bắt buộc; schema search hiện không bắt buộc. Backend nên validate để đảm bảo nhất quán.

## 4. Thời gian giao dịch

SRS upload yêu cầu `DD-MM-YYYY HH:mm:ss`; schema create/update chỉ minh họa ngày `DD-MM-YYYY`. Cần chốt API nhận date hay datetime cho `transactionDate` và `accountingDate`.

## 5. Export

Xác nhận file export trả đủ cột SRS, nhất là **Người tạo**, và có header `Content-Disposition` để frontend đặt đúng tên file.
