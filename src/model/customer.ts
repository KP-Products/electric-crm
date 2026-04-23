export interface Customer {
  id: string;
  customerCode: string;
  fullName: string;
  taxNo: string;
  phone: string;
  email: string;
  fileContractName: string;
  contactName: string;
  contactIdNo: string;
  contactIssueDate: string; // date string
  address: string;
  createdAt: string; // ISO datetime
  createdBy: string;
  updatedAt: string; // ISO datetime
  updatedBy: string;
}
export interface CustomerFilter {
  phone?: string;
  provinceCode?: string;
  customerType?: string;
  wardCode?: string;
  branchCode?: string;
  status?: string;
}

export interface CustomerGroup extends UpdateCustomerGroupReq {}

export interface CreateCustomerGroupReq {
  name: string;
  value: string;
  customerType?: string;
  note?: string;
  status?: string;
}

export interface UpdateCustomerGroupReq extends CreateCustomerGroupReq {
  id: string;
}
