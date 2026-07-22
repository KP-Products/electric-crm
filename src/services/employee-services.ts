import appServices from '@app-services';
import { ApiResponse } from 'model/common';
import {
  AddSalaryHistoryReq,
  CreateEmployeeReq,
  DeleteEmployeeRes,
  EmployeeIdReq,
  EmployeeRes,
  EmployeeWithHistoryRes,
  SalaryHistoryIdReq,
  SearchEmployeesReq,
  SearchEmployeesRes,
  UpdateEmployeeReq,
  UploadEmployeeFileReq
} from 'model/employee';
import { BlobFileResponse, getFileNameFromDisposition } from 'utils/blob-response';
import { ApiConstants } from './networking/app-apis';

async function searchEmployees(
  params: SearchEmployeesReq
): Promise<ApiResponse<SearchEmployeesRes>> {
  try {
    const rs = await appServices.post(ApiConstants.EMPLOYEE_SEARCH, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function createEmployee(
  params: CreateEmployeeReq
): Promise<ApiResponse<EmployeeWithHistoryRes>> {
  try {
    const rs = await appServices.post(ApiConstants.EMPLOYEE_CREATE, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function updateEmployee(
  params: UpdateEmployeeReq
): Promise<ApiResponse<EmployeeWithHistoryRes>> {
  try {
    const rs = await appServices.post(ApiConstants.EMPLOYEE_UPDATE, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function getEmployeeDetail(
  params: EmployeeIdReq
): Promise<ApiResponse<EmployeeWithHistoryRes>> {
  try {
    const rs = await appServices.post(ApiConstants.EMPLOYEE_DETAIL, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function deleteEmployee(params: EmployeeIdReq): Promise<ApiResponse<DeleteEmployeeRes>> {
  try {
    const rs = await appServices.post(ApiConstants.EMPLOYEE_DELETE, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function uploadEmployeeAvatar(
  params: UploadEmployeeFileReq
): Promise<ApiResponse<EmployeeRes>> {
  try {
    const formData = new FormData();
    formData.append('file', params.file);
    const rs = await appServices.post(
      `${ApiConstants.EMPLOYEE_BASE}/${params.id}/avatar/upload`,
      formData
    );
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function deleteEmployeeAvatar(params: EmployeeIdReq): Promise<ApiResponse<EmployeeRes>> {
  try {
    const rs = await appServices.post(`${ApiConstants.EMPLOYEE_BASE}/${params.id}/avatar/delete`);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function uploadEmployeeContractFile(
  params: UploadEmployeeFileReq
): Promise<ApiResponse<EmployeeRes>> {
  try {
    const formData = new FormData();
    formData.append('file', params.file);
    const rs = await appServices.post(
      `${ApiConstants.EMPLOYEE_BASE}/${params.id}/contract-file/upload`,
      formData
    );
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function deleteEmployeeContractFile(
  params: EmployeeIdReq
): Promise<ApiResponse<EmployeeRes>> {
  try {
    const rs = await appServices.post(
      `${ApiConstants.EMPLOYEE_BASE}/${params.id}/contract-file/delete`
    );
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function viewEmployeeAvatar(id: number): Promise<BlobFileResponse | unknown> {
  try {
    const rs = await appServices.get(`${ApiConstants.EMPLOYEE_BASE}/${id}/avatar/view`, {
      responseType: 'blob'
    });
    return {
      blob: rs.data,
      contentType: rs.headers['content-type'],
      fileName: getFileNameFromDisposition(rs.headers['content-disposition'])
    };
  } catch (error: any) {
    return error;
  }
}

async function downloadEmployeeAvatar(id: number): Promise<BlobFileResponse | unknown> {
  try {
    const rs = await appServices.get(`${ApiConstants.EMPLOYEE_BASE}/${id}/avatar/download`, {
      responseType: 'blob'
    });
    return {
      blob: rs.data,
      contentType: rs.headers['content-type'],
      fileName: getFileNameFromDisposition(rs.headers['content-disposition'])
    };
  } catch (error: any) {
    return error;
  }
}

async function viewEmployeeContractFile(id: number): Promise<BlobFileResponse | unknown> {
  try {
    const rs = await appServices.get(`${ApiConstants.EMPLOYEE_BASE}/${id}/contract-file/view`, {
      responseType: 'blob'
    });
    return {
      blob: rs.data,
      contentType: rs.headers['content-type'],
      fileName: getFileNameFromDisposition(rs.headers['content-disposition'])
    };
  } catch (error: any) {
    return error;
  }
}

async function downloadEmployeeContractFile(id: number): Promise<BlobFileResponse | unknown> {
  try {
    const rs = await appServices.get(`${ApiConstants.EMPLOYEE_BASE}/${id}/contract-file/download`, {
      responseType: 'blob'
    });
    return {
      blob: rs.data,
      contentType: rs.headers['content-type'],
      fileName: getFileNameFromDisposition(rs.headers['content-disposition'])
    };
  } catch (error: any) {
    return error;
  }
}

async function addSalaryHistory(
  params: AddSalaryHistoryReq
): Promise<ApiResponse<EmployeeWithHistoryRes>> {
  try {
    const rs = await appServices.post(ApiConstants.EMPLOYEE_SALARY_HISTORY_ADD, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function deleteSalaryHistory(
  params: SalaryHistoryIdReq
): Promise<ApiResponse<DeleteEmployeeRes>> {
  try {
    const rs = await appServices.post(ApiConstants.EMPLOYEE_SALARY_HISTORY_DELETE, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

const employeeServices = {
  searchEmployees,
  createEmployee,
  updateEmployee,
  getEmployeeDetail,
  deleteEmployee,
  uploadEmployeeAvatar,
  deleteEmployeeAvatar,
  uploadEmployeeContractFile,
  deleteEmployeeContractFile,
  viewEmployeeAvatar,
  downloadEmployeeAvatar,
  viewEmployeeContractFile,
  downloadEmployeeContractFile,
  addSalaryHistory,
  deleteSalaryHistory
};

export default employeeServices;
