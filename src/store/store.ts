import { configureStore } from '@reduxjs/toolkit';

// store
import designReducer from './design/slice';
import { createHistoryMiddleware } from './history/historyMiddleware';

export type RootState = { design: ReturnType<typeof designReducer> };

export const store = configureStore({
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(createHistoryMiddleware()),
  reducer: {
    design: designReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
