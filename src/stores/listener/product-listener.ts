import { takeLatestListeners } from '@listener';
import { productActions } from '@redux-slice/product-slice';
import productServices from 'services/product-services';
import { isSuccess } from 'services/networking/app-helper';

takeLatestListeners({
  actionCreator: productActions.getProducts,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    const response = await productServices.getProduct(body);
    if (isSuccess(response) && response.data) {
      onSuccess?.(response.data);
      listenerApi.dispatch(productActions.setProducts(response.data.content));
      return;
    }
    onFailed?.(response);
  }
});

takeLatestListeners({
  actionCreator: productActions.getProductDetail,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    const response = await productServices.getProductDetail(body);
    if (isSuccess(response) && response.data) {
      onSuccess?.(response.data);
      return;
    }
    onFailed?.(response);
  }
});

takeLatestListeners({
  actionCreator: productActions.createProducts,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    const response = await productServices.createProduct(body);
    if (isSuccess(response) && response.data) {
      onSuccess?.(response.data);
      return;
    }
    onFailed?.(response);
  }
});

takeLatestListeners({
  actionCreator: productActions.updateProducts,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    const response = await productServices.updateProduct(body);
    if (isSuccess(response)) {
      onSuccess?.(response.data);
      return;
    }
    onFailed?.(response);
  }
});

takeLatestListeners({
  actionCreator: productActions.downloadProducts,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    const response = await productServices.downloadProduct(body);
    if (isSuccess(response) && response.data) {
      onSuccess?.(response.data);
      return;
    }
    onFailed?.(response);
  }
});

takeLatestListeners({
  actionCreator: productActions.reviseProduct,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    const response = await productServices.reviseProduct(body);
    if (isSuccess(response)) {
      onSuccess?.(response.data);
      return;
    }
    onFailed?.(response);
  }
});

takeLatestListeners({
  actionCreator: productActions.changeFee,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    const response = await productServices.changeFee(body);
    if (isSuccess(response)) {
      onSuccess?.(response.data);
      return;
    }
    onFailed?.(response);
  }
});

takeLatestListeners({
  actionCreator: productActions.changeFeeRevise,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    const response = await productServices.changeFeeRevise(body);
    if (isSuccess(response) && response.data) {
      onSuccess?.(response.data);
      return;
    }
    onFailed?.(response);
  }
});
