'use client';

import OwnerDocuments from 'components/owner-documents';
import { DOCUMENT_OWNER_TYPE } from 'model/document';
import { customerDocumentOwnerId } from './create-utils';

export default function CustomerDocuments({
  customerId,
  ...props
}: {
  customerId: number;
  files?: File[];
  onFilesChange?: (files: File[]) => void;
  disabled?: boolean;
  revision?: number;
}) {
  return (
    <OwnerDocuments
      {...props}
      ownerType={DOCUMENT_OWNER_TYPE.CUSTOMER}
      ownerId={customerDocumentOwnerId(customerId)}
    />
  );
}
