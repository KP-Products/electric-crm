import appServices from '@app-services';
import { ApiResponse } from 'model/common';
import {
  CreateFormManagementResponse,
  FormManagementDetailBody,
  FormManagementDetailResponse,
  FormManagementListBody,
  FormManagementListResponse,
  SourceTableResponse,
  UpdateFormManagementResponse
} from 'model/form-management';
import { ApiConstants } from './networking/app-apis';

async function getListFormManagement(
  body?: FormManagementListBody
): Promise<ApiResponse<FormManagementListResponse>> {
  try {
    const { data } = await appServices.post(ApiConstants.FORM_MANAGEMENT_LIST, body);
    return data;
  } catch (error: any) {
    return error;
  }
}

async function createFormManagement(
  body?: FormManagementDetailBody
): Promise<ApiResponse<CreateFormManagementResponse>> {
  try {
    const { data } = await appServices.post(ApiConstants.FORM_MANAGEMENT_CREATE, body);
    return data;
  } catch (error: any) {
    return error;
  }
}

async function updateFormManagement(
  body?: FormManagementDetailBody
): Promise<ApiResponse<UpdateFormManagementResponse>> {
  try {
    const { data } = await appServices.post(ApiConstants.FORM_MANAGEMENT_UPDATE, body);
    return data;
  } catch (error: any) {
    return error;
  }
}

async function getDetailFormManagement(
  templateId: string | number
): Promise<ApiResponse<FormManagementDetailResponse>> {
  try {
    const { data } = await appServices.post(ApiConstants.FORM_MANAGEMENT_DETAIL, { templateId });
    return data;
  } catch (error: any) {
    return error;
  }
}

async function getSourceTable(): Promise<ApiResponse<SourceTableResponse>> {
  try {
    const { data } = await appServices.post(ApiConstants.FORM_MANAGEMENT_SOURCE_TABLE);
    return data;
  } catch (error: any) {
    return error;
  }
}

const formManagementServices = {
  getListFormManagement,
  createFormManagement,
  updateFormManagement,
  getDetailFormManagement,
  getSourceTable
};

export default formManagementServices;
