import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import assetReducer from './assetSlice';
import issueReducer from './issueSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    assets: assetReducer,
    issues: issueReducer,
  },
});