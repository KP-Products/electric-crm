import { z } from 'zod';

const text = z.string().trim();
export const customerPersonSchema = z.object({
  fullName: text.max(255, 'Tên không được quá 255 ký tự'),
  idNo: text.regex(/^([0-9]{12})?$/, 'CCCD phải gồm 12 chữ số'),
  phone: text.regex(/^([+]?[0-9]{8,15})?$/, 'Số điện thoại không hợp lệ'),
  email: text
    .max(255, 'Email không được quá 255 ký tự')
    .refine((value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), 'Email không hợp lệ')
});
export const emptyCustomerPerson = () => ({ fullName: '', idNo: '', phone: '', email: '' });

export const customerDocumentOwnerId = (id: number) => {
  if (!Number.isSafeInteger(id) || id <= 0) throw new Error('ID khách hàng không hợp lệ');
  return `00000000-0000-0000-${id.toString(16).padStart(16, '0').slice(0, 4)}-${id.toString(16).padStart(16, '0').slice(4)}`;
};

export { validateDocumentFile as validateCustomerFile } from 'utils/document-upload';
