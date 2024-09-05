import { configureStore } from '@reduxjs/toolkit';
import tripPlanFormReducer from './slices/tripFormSlice';
import tripPlanResultReducer from './slices/tripPlanResult';

export const store = configureStore({
  reducer: {
    planForm: tripPlanFormReducer,
    planResult: tripPlanResultReducer,
  },
  devTools: true,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;