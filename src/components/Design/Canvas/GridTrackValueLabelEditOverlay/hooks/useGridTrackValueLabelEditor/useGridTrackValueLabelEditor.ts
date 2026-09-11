import { useCallback, useEffect, useState } from 'react';

// store
import { store, useAppDispatch, useAppSelector } from 'store';
import { selectGridTrackValueEditRequest, selectViewport } from 'store/design/selectors';
import { setGridTrackValueEditRequest } from 'store/design/slice';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TGridTrackValueLabelEditor } from './types';

// utils
import { commitGridTrackValueEdit } from './utils/commitGridTrackValueEdit/commitGridTrackValueEdit';
import { commitGridTrackValueLiveChange } from './utils/commitGridTrackValueLiveChange';
import { resolveGridTrackValueEditRequest } from './utils/resolveGridTrackValueEditRequest';
import { TGridTrackValueEditTarget } from 'utils/canvas/gridSlots/getGridTrackValueEditTarget';

export const useGridTrackValueLabelEditor = (refs: TCanvasRefs): TGridTrackValueLabelEditor => {
  const request = useAppSelector(selectGridTrackValueEditRequest);
  const [edit, setEdit] = useState<TGridTrackValueEditTarget | null>(null);
  const viewport = useAppSelector(selectViewport);
  const dispatch = useAppDispatch();

  useEffect(() => {
    setEdit(resolveGridTrackValueEditRequest(dispatch, refs, store.getState(), request));
  }, [dispatch, refs, request]);

  const cancel = useCallback((): void => {
    dispatch(setGridTrackValueEditRequest(null));
  }, [dispatch]);

  const commit = useCallback(
    (raw: string): void => {
      if (edit) {
        commitGridTrackValueEdit(dispatch, store.getState(), edit, raw);
      }

      dispatch(setGridTrackValueEditRequest(null));
    },
    [dispatch, edit],
  );

  const liveChange = useCallback(
    (raw: string): void => {
      if (edit) {
        setEdit(commitGridTrackValueLiveChange(refs, store.getState(), edit, raw));
      }
    },
    [edit, refs],
  );

  return { cancel, commit, edit, liveChange, viewport };
};
