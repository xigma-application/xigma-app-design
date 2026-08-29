import { useEffect } from 'react';
import { useSearchParams } from 'react-router';

// store
import { setActivePage } from 'store/design/slice';
import { selectActivePageId, selectPages } from 'store/design/selectors';
import { AppDispatch, store, useAppDispatch } from 'store';

const applyPageParam = (dispatch: AppDispatch, pageParam: string | null): void => {
  const state = store.getState();

  if (pageParam && selectPages(state)[pageParam] && pageParam !== selectActivePageId(state)) {
    dispatch(setActivePage(pageParam));
  }
};

export const useSyncActivePageFromUrl = (): void => {
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const pageParam = searchParams.get('page');

  useEffect(() => {
    applyPageParam(dispatch, pageParam);
  }, [dispatch, pageParam]);
};
