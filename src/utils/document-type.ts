import { type AppSelectOption } from 'components/select';

export const DOCUMENT_TYPE = {
  QUYET_DINH: 'QUYET_DINH',
  QUY_CHE: 'QUY_CHE',
  QUY_DINH: 'QUY_DINH',
  NGHI_QUYET: 'NGHI_QUYET',
  THONG_BAO: 'THONG_BAO',
  HUONG_DAN: 'HUONG_DAN',
  CONG_VAN: 'CONG_VAN',
  KHAC: 'KHAC'
} as const;

export const DOCUMENT_TYPE_OPTIONS: AppSelectOption[] = [
  { value: DOCUMENT_TYPE.QUYET_DINH, label: 'Quyết định' },
  { value: DOCUMENT_TYPE.QUY_CHE, label: 'Quy chế' },
  { value: DOCUMENT_TYPE.QUY_DINH, label: 'Quy định' },
  { value: DOCUMENT_TYPE.NGHI_QUYET, label: 'Nghị quyết' },
  { value: DOCUMENT_TYPE.THONG_BAO, label: 'Thông báo' },
  { value: DOCUMENT_TYPE.HUONG_DAN, label: 'Hướng dẫn' },
  { value: DOCUMENT_TYPE.CONG_VAN, label: 'Công văn' },
  { value: DOCUMENT_TYPE.KHAC, label: 'Khác' }
];

export const DOCUMENT_TYPE_FILTER_OPTIONS: AppSelectOption[] = [
  { value: '', label: '-- Tất cả --' },
  ...DOCUMENT_TYPE_OPTIONS
];

const normalizeLookupKey = (value?: string) =>
  value
    ?.trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || '';

const DOCUMENT_TYPE_ALIAS_MAP: Record<string, string> = {
  QUYET_DINH: DOCUMENT_TYPE.QUYET_DINH,
  QUY_CHE: DOCUMENT_TYPE.QUY_CHE,
  QUY_DINH: DOCUMENT_TYPE.QUY_DINH,
  NGHI_QUYET: DOCUMENT_TYPE.NGHI_QUYET,
  THONG_BAO: DOCUMENT_TYPE.THONG_BAO,
  HUONG_DAN: DOCUMENT_TYPE.HUONG_DAN,
  CONG_VAN: DOCUMENT_TYPE.CONG_VAN,
  KHAC: DOCUMENT_TYPE.KHAC
};

export const normalizeDocumentType = (value?: string) =>
  DOCUMENT_TYPE_ALIAS_MAP[normalizeLookupKey(value)] || '';

export const getDocumentTypeLabel = (value?: string) =>
  String(DOCUMENT_TYPE_OPTIONS.find((option) => option.value === value)?.label || value || '');
