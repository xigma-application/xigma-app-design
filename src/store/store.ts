import { configureStore, ThunkAction, UnknownAction } from '@reduxjs/toolkit';

// store
import designReducer from './design/slice';
import { createHistoryStack, THistoryStack } from './history/createHistoryStack';
import { createHistoryMiddleware } from './history/historyMiddleware';

export type RootState = { design: ReturnType<typeof designReducer> };

export const historyStack = createHistoryStack();

export const store = configureStore({
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ immutableCheck: false, serializableCheck: false, thunk: { extraArgument: historyStack } }).concat(
      createHistoryMiddleware(historyStack),
    ),
  reducer: {
    design: designReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, THistoryStack, UnknownAction>;
