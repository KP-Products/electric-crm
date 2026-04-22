import { ResultBase } from 'model/common';

export interface GetTemplateReq {
  templateName: string;
}

export interface TemplateData {
  base64Data: string;
}

export interface GetTemplateRes extends ResultBase<TemplateData> {}

export interface Unit {
  id: string;
  code: string;
  name: string;
  status: string;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  status: string;
}

export interface GetListUnitRes extends ResultBase<Unit[]> {}

export interface GetListDepartmentReq {
  unitCode: string;
}

export interface GetListDepartmentRes extends ResultBase<Department[]> {}
