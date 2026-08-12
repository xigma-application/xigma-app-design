import { configureStore } from '@reduxjs/toolkit';

// store
import designReducer from './design/slice';

export const store = configureStore({
  reducer: {
    design: designReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
