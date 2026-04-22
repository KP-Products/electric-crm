import appServices from '@app-services';
import { ApiConstants } from 'services/networking/app-apis';
import { ApiResponse, PaginationRes, ResultBase } from 'model/common';
import {
  ChangeFeeProductReq,
  CreateProduct,
  Product,
  ProductDownload,
  ProductFilter,
  UpdateProduct
} from 'model/product';

async function getProduct(
  param: ProductFilter
): Promise<ApiResponse<ResultBase<PaginationRes<Product>>>> {
  try {
    const rs = await appServices.post(ApiConstants.PRODUCT_LIST, param);
    const data = rs.data;
    return data;
  } catch (error: any) {
    return error;
  }
}

async function getProductDetail(id: string): Promise<ApiResponse<ResultBase<Product>>> {
  try {
    const rs = await appServices.post(ApiConstants.PRODUCT_DETAIL, { id: id });
    const data = rs.data;
    return data;
  } catch (error: any) {
    return error;
  }
}

async function createProduct(param: CreateProduct): Promise<ApiResponse<ResultBase<Product>>> {
  try {
    const rs = await appServices.post(ApiConstants.PRODUCT_CREATE, param);
    const data = rs.data;
    return data;
  } catch (error: any) {
    return error;
  }
}

async function updateProduct(param: UpdateProduct): Promise<ApiResponse<ResultBase<Product>>> {
  try {
    const rs = await appServices.post(ApiConstants.PRODUCT_UPDATE, param);
    const data = rs.data;
    return data;
  } catch (error: any) {
    return error;
  }
}

async function downloadProduct(param: ProductDownload): Promise<ApiResponse<ResultBase<string>>> {
  try {
    const rs = await appServices.post(ApiConstants.PRODUCT_DOWNLOAD, param);
    const data = rs.data;
    return data;
  } catch (error: any) {
    return error;
  }
}

async function reviseProduct(param: UpdateProduct): Promise<ApiResponse<ResultBase<Product>>> {
  try {
    const rs = await appServices.post(ApiConstants.PRODUCT_REVISE, param);
    const data = rs.data;
    return data;
  } catch (error: any) {
    return error;
  }
}

async function changeFee(param: ChangeFeeProductReq): Promise<ApiResponse<ResultBase<null>>> {
  try {
    const rs = await appServices.post(ApiConstants.PRODUCT_CHANGE_FEE, param);
    const data = rs.data;
    return data;
  } catch (error: any) {
    return error;
  }
}

async function changeFeeRevise(
  param: ChangeFeeProductReq
): Promise<ApiResponse<ResultBase<Product>>> {
  try {
    const rs = await appServices.post(ApiConstants.PRODUCT_CHANGE_FEE_REVISE, param);
    const data = rs.data;
    return data;
  } catch (error: any) {
    return error;
  }
}

const productServices = {
  getProduct,
  getProductDetail,
  createProduct,
  updateProduct,
  downloadProduct,
  reviseProduct,
  changeFee,
  changeFeeRevise
};

export default productServices;
