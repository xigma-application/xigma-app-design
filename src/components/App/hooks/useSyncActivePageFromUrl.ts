import { useEffect } from 'react';

// store
import { setActivePage } from 'store/design/slice';
import { selectActivePageId, selectPages } from 'store/design/selectors';
import { AppDispatch, store, useAppDispatch } from 'store';

// utils
import { getQueryParam } from '../utils/getQueryParam';

const applyPageParam = (dispatch: AppDispatch, pageParam: string | null): void => {
  const state = store.getState();

  if (pageParam && selectPages(state)[pageParam] && pageParam !== selectActivePageId(state)) {
    dispatch(setActivePage(pageParam));
  }
};

export const useSyncActivePageFromUrl = (): void => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    applyPageParam(dispatch, getQueryParam('page'));
  }, [dispatch]);
};
