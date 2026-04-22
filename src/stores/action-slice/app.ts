import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SLICE_NAME } from 'stores/types';

export enum LANGUAGE_TYPE {
  vi = 'vi',
  en = 'en'
}

export interface AppState {
  language: LANGUAGE_TYPE;
  selectedMenuKeys: string[];
  selectedOpenKeys: string[];
}

export const initialApp: AppState = {
  language: LANGUAGE_TYPE.vi,
  selectedMenuKeys: [],
  selectedOpenKeys: []
};

const appSlice = createSlice({
  name: SLICE_NAME.APP,
  initialState: initialApp,
  reducers: {
    setLanguage(state, { payload }: PayloadAction<LANGUAGE_TYPE>) {
      state.language = payload;
    },
    setSelectedMenuKeys(state, action: PayloadAction<string[]>) {
      state.selectedMenuKeys = action.payload;
    },
    setSelectedOpenKeys(state, action: PayloadAction<string[]>) {
      state.selectedOpenKeys = action.payload;
    }
  }
});

export const appActions = {
  ...appSlice.actions
};

export const appReducer = appSlice.reducer;
