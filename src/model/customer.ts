export interface Customer {
  id: string;
  name: string;
  cif: string;
  accountNumber: string;
  customerType: string;
  branchCode: string;
  wardCode: string;
  provinceCode: string;
  status: string;
  phone: string;
  effectiveDate: string;
  expireDate: string;
  updatedBy: string | null;
  updatedAt: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
  createdAt: string;
  createdBy: string | null;
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
