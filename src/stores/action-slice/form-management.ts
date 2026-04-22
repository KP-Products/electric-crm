import {
  CREATE_FORM_MANAGEMENT,
  GET_DETAIL_FORM_MANAGEMENT,
  GET_LIST_FORM_MANAGEMENT,
  GET_SOURCE_TABLE,
  UPDATE_FORM_MANAGEMENT
} from '@redux-action-type/form-management';
import { createAction, createSlice } from '@reduxjs/toolkit';
import { ErrorBase } from 'model/common';
import {
  CreateFormManagementResponse,
  FormManagementDetailBody,
  FormManagementDetailResponse,
  FormManagementListBody,
  FormManagementListResponse,
  FormManagementState,
  SourceTableResponse,
  UpdateFormManagementResponse
} from 'model/form-management';
import { SLICE_NAME } from 'stores/types';

export const initialFormManagement: FormManagementState = {
  loading: false,
  formManagementList: [],
  totalElements: 0,
  sourceTable: []
};

export const formManagementSlice = createSlice({
  name: SLICE_NAME.FORM_MANAGEMENT,
  initialState: initialFormManagement,
  reducers: {
    reset: () => initialFormManagement,
    onChangeState: (state, { payload }: { payload: Partial<FormManagementState> }) => {
      return { ...state, ...payload };
    }
  }
});

const getListFormManagement = createAction(
  GET_LIST_FORM_MANAGEMENT,
  (
    body?: FormManagementListBody,
    onSuccess?: (response: FormManagementListResponse) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const createFormManagement = createAction(
  CREATE_FORM_MANAGEMENT,
  (
    body: FormManagementDetailBody,
    onSuccess?: (response: CreateFormManagementResponse) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const updateFormManagement = createAction(
  UPDATE_FORM_MANAGEMENT,
  (
    body: FormManagementDetailBody,
    onSuccess?: (response: UpdateFormManagementResponse) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const getDetailFormManagement = createAction(
  GET_DETAIL_FORM_MANAGEMENT,
  (
    templateId: string | number,
    onSuccess?: (response: FormManagementDetailResponse) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { templateId, onSuccess, onFailed }
  })
);

const getSourceTable = createAction(
  GET_SOURCE_TABLE,
  (
    onSuccess?: (response: SourceTableResponse) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({ payload: { onSuccess, onFailed } })
);

export const formManagementActions = {
  ...formManagementSlice.actions,
  getListFormManagement,
  createFormManagement,
  updateFormManagement,
  getDetailFormManagement,
  getSourceTable
};
