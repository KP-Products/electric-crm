import { DOCUMENT_TYPE } from 'model/document';
import documentServices from 'services/document-services';

/**
 * documents.owner_id là uuid còn id khách hàng là số → BE quy ước uuid(0, id),
 * vd khách hàng 12 → 00000000-0000-0000-0000-00000000000c.
 */
export const customerDocumentOwnerId = (customerId: number) => {
  const hex = customerId.toString(16).padStart(16, '0');
  return `00000000-0000-0000-${hex.slice(0, 4)}-${hex.slice(4)}`;
};

/** Upload lần lượt các file đã chọn; trả về tên file lỗi để màn hình báo riêng. */
export const uploadOwnerDocuments = async (
  ownerType: string,
  ownerId: string,
  files: File[]
): Promise<string[]> => {
  const failed: string[] = [];
  for (const file of files) {
    const response: any = await documentServices.uploadDocument({
      ownerType,
      ownerId,
      docType: DOCUMENT_TYPE.KHAC,
      file
    });
    if (!response?.data?.id) failed.push(file.name);
  }
  return failed;
};
