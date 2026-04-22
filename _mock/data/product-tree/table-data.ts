export interface ProductTreeTableData {
  key: string;
  action?: React.ReactNode;
  feeCode?: string;
  type: string;
  code: string;
  name: string;
  status: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface FeeScheduleTableData {
  key: string;
  feeName: string;
  effectiveDate?: string;
  expirationDate?: string;
  status?: string;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  approvedBy: string;
  approvedAt: string;
  recipe?: string;
  code?: string;
}

export const productTreeTableData: ProductTreeTableData[] = [
  {
    key: '1',
    type: 'Cấp 1',
    code: 'NV',
    name: 'Nghiệp vụ',
    status: 'Đang hoạt động',
    createdAt: '2024-01-15',
    createdBy: 'Admin',
    updatedAt: '2024-01-20',
    updatedBy: 'Admin'
  },
  {
    key: '2',
    type: 'Cấp 2',
    code: 'SP1',
    name: 'Sản phẩm cấp 1',
    status: 'Đang hoạt động',
    createdAt: '2024-01-16',
    createdBy: 'Admin',
    updatedAt: '2024-01-21',
    updatedBy: 'Admin'
  },
  {
    key: '3',
    type: 'Cấp 3',
    code: 'SP2',
    name: 'Sản phẩm cấp 2',
    status: 'Đang hoạt động',
    createdAt: '2024-01-17',
    createdBy: 'Admin',
    updatedAt: '2024-01-22',
    updatedBy: 'Admin'
  },
  {
    key: '4',
    type: 'Cấp 4',
    code: 'SP3',
    name: 'Sản phẩm cấp 3',
    status: 'Đang hoạt động',
    createdAt: '2024-01-18',
    createdBy: 'Admin',
    updatedAt: '2024-01-23',
    updatedBy: 'Admin'
  },
  {
    key: '5',
    type: 'Cấp 5',
    code: 'SP4',
    name: 'Sản phẩm cấp 4',
    status: 'Đang hoạt động',
    createdAt: '2024-01-19',
    createdBy: 'Admin',
    updatedAt: '2024-01-24',
    updatedBy: 'Admin'
  },
  {
    key: '6',
    feeCode: 'GD02',
    type: 'Cấp 6',
    code: 'GD02',
    name: 'GD chuyển tiền CITAD',
    status: 'Đang hoạt động',
    createdAt: '2024-01-20',
    createdBy: 'Admin',
    updatedAt: '2024-01-25',
    updatedBy: 'Admin'
  },
  {
    key: '7',
    feeCode: 'GD01',
    type: 'Cấp 6',
    code: 'GD01',
    name: 'GD chuyển tiền NAPAS',
    status: 'Đang hoạt động',
    createdAt: '2024-01-21',
    createdBy: 'Admin',
    updatedAt: '2024-01-26',
    updatedBy: 'Admin'
  },
  {
    key: '8',
    feeCode: 'GD03',
    type: 'Cấp 6',
    code: 'GD03',
    name: 'GD chuyển tiền VNPay',
    status: 'Đang hoạt động',
    createdAt: '2024-01-22',
    createdBy: 'Admin',
    updatedAt: '2024-01-27',
    updatedBy: 'Admin'
  },
  {
    key: '9',
    type: 'Cấp 2',
    code: 'SP5',
    name: 'Sản phẩm cấp 5',
    status: 'Không hoạt động',
    createdAt: '2024-01-23',
    createdBy: 'Admin',
    updatedAt: '2024-01-28',
    updatedBy: 'Admin'
  },
  {
    key: '10',
    type: 'Cấp 3',
    code: 'SP6',
    name: 'Sản phẩm cấp 6',
    status: 'Đang xử lý',
    createdAt: '2024-01-24',
    createdBy: 'Admin',
    updatedAt: '2024-01-29',
    updatedBy: 'Admin'
  }
];

export const feeScheduleTableData: FeeScheduleTableData[] = [
  {
    key: '1',
    code: '1',
    feeName: 'HP GD TK11 / qoi TK11 va GD tien mat',
    effectiveDate: '',
    expirationDate: '',
    status: '',
    createdBy: 'Ngoc Anh17',
    createdAt: '10/11/2025',
    updatedBy: 'Ngoc Tu',
    updatedAt: '10/11/2025',
    approvedBy: 'Ngoc Tu',
    approvedAt: '10/11/2025'
  },
  {
    key: '2',
    feeName: 'HP GD TK12 / qoi TK12 va GD tien mat',
    effectiveDate: '01/01/2025',
    expirationDate: '31/12/2025',
    status: 'Đang hoạt động',
    createdBy: 'Ngoc Anh17',
    createdAt: '10/11/2025',
    updatedBy: 'Ngoc Tu',
    updatedAt: '10/11/2025',
    approvedBy: 'Ngoc Tu',
    approvedAt: '10/11/2025'
  },
  {
    key: '3',
    feeName: 'HP GD TK13 / qoi TK13 va GD tien mat',
    effectiveDate: '01/01/2025',
    expirationDate: '31/12/2025',
    status: 'Đang hoạt động',
    createdBy: 'Ngoc Anh18',
    createdAt: '11/11/2025',
    updatedBy: 'Ngoc Anh18',
    updatedAt: '11/11/2025',
    approvedBy: 'Ngoc Tu',
    approvedAt: '11/11/2025'
  },
  {
    key: '4',
    feeName: 'HP GD TK14 / qoi TK14 va GD tien mat',
    effectiveDate: '01/02/2025',
    expirationDate: '28/02/2025',
    status: 'Hết hiệu lực',
    createdBy: 'Ngoc Anh19',
    createdAt: '12/11/2025',
    updatedBy: 'Ngoc Anh19',
    updatedAt: '12/11/2025',
    approvedBy: 'Ngoc Tu',
    approvedAt: '12/11/2025'
  },
  {
    key: '5',
    feeName: 'HP GD TK15 / qoi TK15 va GD tien mat',
    effectiveDate: '01/03/2025',
    expirationDate: '31/03/2025',
    status: 'Đang hoạt động',
    createdBy: 'Ngoc Anh20',
    createdAt: '13/11/2025',
    updatedBy: 'Ngoc Anh20',
    updatedAt: '13/11/2025',
    approvedBy: 'Ngoc Tu',
    approvedAt: '13/11/2025'
  },
  {
    key: '6',
    feeName: 'HP GD TK16 / qoi TK16 va GD tien mat',
    effectiveDate: '01/04/2025',
    expirationDate: '30/04/2025',
    status: 'Đang hoạt động',
    createdBy: 'Ngoc Anh21',
    createdAt: '14/11/2025',
    updatedBy: 'Ngoc Anh21',
    updatedAt: '14/11/2025',
    approvedBy: 'Ngoc Tu',
    approvedAt: '14/11/2025'
  },
  {
    key: '7',
    feeName: 'HP GD TK17 / qoi TK17 va GD tien mat',
    effectiveDate: '01/05/2025',
    expirationDate: '31/05/2025',
    status: 'Chờ duyệt',
    createdBy: 'Ngoc Anh22',
    createdAt: '15/11/2025',
    updatedBy: 'Ngoc Anh22',
    updatedAt: '15/11/2025',
    approvedBy: '',
    approvedAt: ''
  },
  {
    key: '8',
    feeName: 'HP GD TK18 / qoi TK18 va GD tien mat',
    effectiveDate: '01/06/2025',
    expirationDate: '30/06/2025',
    status: 'Đang hoạt động',
    createdBy: 'Ngoc Anh23',
    createdAt: '16/11/2025',
    updatedBy: 'Ngoc Anh23',
    updatedAt: '16/11/2025',
    approvedBy: 'Ngoc Tu',
    approvedAt: '16/11/2025'
  },
  {
    key: '9',
    feeName: 'HP GD TK19 / qoi TK19 va GD tien mat',
    effectiveDate: '01/07/2025',
    expirationDate: '31/07/2025',
    status: 'Đang hoạt động',
    createdBy: 'Ngoc Anh24',
    createdAt: '17/11/2025',
    updatedBy: 'Ngoc Anh24',
    updatedAt: '17/11/2025',
    approvedBy: 'Ngoc Tu',
    approvedAt: '17/11/2025'
  },
  {
    key: '10',
    feeName: 'HP GD TK20 / qoi TK20 va GD tien mat',
    effectiveDate: '01/08/2025',
    expirationDate: '31/08/2025',
    status: 'Đang hoạt động',
    createdBy: 'Ngoc Anh25',
    createdAt: '18/11/2025',
    updatedBy: 'Ngoc Anh25',
    updatedAt: '18/11/2025',
    approvedBy: 'Ngoc Tu',
    approvedAt: '18/11/2025'
  }
];

export const feeScheduleTableDataLast: FeeScheduleTableData[] = [
  {
    key: '1',
    feeName: 'HP GD TK11 / qoi TK11 va GD tien mat',
    effectiveDate: '',
    expirationDate: '',
    status: '',
    createdBy: 'Ngoc Anh17',
    createdAt: '10/11/2025',
    updatedBy: 'Ngoc Tu',
    updatedAt: '10/11/2025',
    approvedBy: 'Ngoc Tu',
    approvedAt: '10/11/2025',
    recipe: ' GD * 0.1%'
  },
  {
    key: '2',
    feeName: 'HP GD TK12 / qoi TK12 va GD tien mat',
    effectiveDate: '01/01/2025',
    expirationDate: '31/12/2025',
    status: 'Đang hoạt động',
    createdBy: 'Ngoc Anh17',
    createdAt: '10/11/2025',
    updatedBy: 'Ngoc Tu',
    updatedAt: '10/11/2025',
    approvedBy: 'Ngoc Tu',
    approvedAt: '10/11/2025',
    recipe: ' GD * 0.1%'
  },
  {
    key: '3',
    feeName: 'HP GD TK13 / qoi TK13 va GD tien mat',
    effectiveDate: '01/01/2025',
    expirationDate: '31/12/2025',
    status: 'Đang hoạt động',
    createdBy: 'Ngoc Anh18',
    createdAt: '11/11/2025',
    updatedBy: 'Ngoc Anh18',
    updatedAt: '11/11/2025',
    approvedBy: 'Ngoc Tu',
    approvedAt: '11/11/2025',
    recipe: ' GD * 0.1%'
  },
  {
    key: '4',
    feeName: 'HP GD TK14 / qoi TK14 va GD tien mat',
    effectiveDate: '01/02/2025',
    expirationDate: '28/02/2025',
    status: 'Hết hiệu lực',
    createdBy: 'Ngoc Anh19',
    createdAt: '12/11/2025',
    updatedBy: 'Ngoc Anh19',
    updatedAt: '12/11/2025',
    approvedBy: 'Ngoc Tu',
    approvedAt: '12/11/2025',
    recipe: ' GD * 0.1%'
  },
  {
    key: '5',
    feeName: 'HP GD TK15 / qoi TK15 va GD tien mat',
    effectiveDate: '01/03/2025',
    expirationDate: '31/03/2025',
    status: 'Đang hoạt động',
    createdBy: 'Ngoc Anh20',
    createdAt: '13/11/2025',
    updatedBy: 'Ngoc Anh20',
    updatedAt: '13/11/2025',
    approvedBy: 'Ngoc Tu',
    approvedAt: '13/11/2025',
    recipe: ' GD * 0.1%'
  },
  {
    key: '6',
    feeName: 'HP GD TK16 / qoi TK16 va GD tien mat',
    effectiveDate: '01/04/2025',
    expirationDate: '30/04/2025',
    status: 'Đang hoạt động',
    createdBy: 'Ngoc Anh21',
    createdAt: '14/11/2025',
    updatedBy: 'Ngoc Anh21',
    updatedAt: '14/11/2025',
    approvedBy: 'Ngoc Tu',
    approvedAt: '14/11/2025',
    recipe: ' GD * 0.1%'
  },
  {
    key: '7',
    feeName: 'HP GD TK17 / qoi TK17 va GD tien mat',
    effectiveDate: '01/05/2025',
    expirationDate: '31/05/2025',
    status: 'Chờ duyệt',
    createdBy: 'Ngoc Anh22',
    createdAt: '15/11/2025',
    updatedBy: 'Ngoc Anh22',
    updatedAt: '15/11/2025',
    approvedBy: '',
    approvedAt: '',
    recipe: ' GD * 0.1%'
  },
  {
    key: '8',
    feeName: 'HP GD TK18 / qoi TK18 va GD tien mat',
    effectiveDate: '01/06/2025',
    expirationDate: '30/06/2025',
    status: 'Đang hoạt động',
    createdBy: 'Ngoc Anh23',
    createdAt: '16/11/2025',
    updatedBy: 'Ngoc Anh23',
    updatedAt: '16/11/2025',
    approvedBy: 'Ngoc Tu',
    approvedAt: '16/11/2025',
    recipe: ' GD * 0.1%'
  },
  {
    key: '9',
    feeName: 'HP GD TK19 / qoi TK19 va GD tien mat',
    effectiveDate: '01/07/2025',
    expirationDate: '31/07/2025',
    status: 'Đang hoạt động',
    createdBy: 'Ngoc Anh24',
    createdAt: '17/11/2025',
    updatedBy: 'Ngoc Anh24',
    updatedAt: '17/11/2025',
    approvedBy: 'Ngoc Tu',
    approvedAt: '17/11/2025',
    recipe: ' GD * 0.1%'
  },
  {
    key: '10',
    feeName: 'HP GD TK20 / qoi TK20 va GD tien mat',
    effectiveDate: '01/08/2025',
    expirationDate: '31/08/2025',
    status: 'Đang hoạt động',
    createdBy: 'Ngoc Anh25',
    createdAt: '18/11/2025',
    updatedBy: 'Ngoc Anh25',
    updatedAt: '18/11/2025',
    approvedBy: 'Ngoc Tu',
    approvedAt: '18/11/2025',
    recipe: ' GD * 0.1%'
  }
];
