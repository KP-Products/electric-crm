import appServices from '@app-services';
import { ApiConstants } from 'services/networking/app-apis';
import { ApiResponse, PaginationRes, ResultBase } from 'model/common';
import { FeeFormula, FeeFormulaCreate, FeeFormulaSearch, FeeFormulaUpdate } from 'model/fee-code';

async function getListFormula(
  param: FeeFormulaSearch
): Promise<ApiResponse<ResultBase<PaginationRes<FeeFormula>>>> {
  try {
    const rs = await appServices.post(ApiConstants.FEE_FORMULA_LIST, param);
    const data = rs.data;
    return data;
  } catch (error: any) {
    return error;
  }
}

async function createFormula(
  param: FeeFormulaCreate
): Promise<ApiResponse<ResultBase<FeeFormula>>> {
  try {
    const rs = await appServices.post(ApiConstants.FEE_FORMULA_CREATE, param);
    const data = rs.data;
    return data;
  } catch (error: any) {
    return error;
  }
}

async function updateFormula(
  param: FeeFormulaUpdate
): Promise<ApiResponse<ResultBase<FeeFormula>>> {
  try {
    const rs = await appServices.post(ApiConstants.FEE_FORMULA_UPDATE, param);
    const data = rs.data;
    return data;
  } catch (error: any) {
    return error;
  }
}

async function deleteFormula(param: string): Promise<ApiResponse<ResultBase<string>>> {
  try {
    const rs = await appServices.post(ApiConstants.FEE_FORMULA_DELETE, { id: param });
    const data = rs.data;
    return data;
  } catch (error: any) {
    return error;
  }
}

async function downloadFormula(): Promise<ApiResponse<ResultBase<string>>> {
  try {
    const rs = await appServices.post(ApiConstants.FEE_FORMULA_DOWNLOAD);
    const data = rs.data;
    return data;
  } catch (error: any) {
    return error;
  }
}

const feeFormulaServices = {
  getListFormula,
  createFormula,
  updateFormula,
  deleteFormula,
  downloadFormula
};

export default feeFormulaServices;
