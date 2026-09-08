import { useCallback, useEffect } from 'react';

// store
import { selectEditingAutoLayoutPadding, selectNodes, selectViewport } from 'store/design/selectors';
import { stopAutoLayoutPaddingEdit, updateNode } from 'store/design/slice';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';

// utils
import { clampAutoLayoutPaddingValue } from '../utils/clampAutoLayoutPaddingValue';
import { getAutoLayoutPaddingEditDetails, TAutoLayoutPaddingEditDetails } from '../utils/getAutoLayoutPaddingEditDetails';
import { getAutoLayoutPaddingKey } from 'utils/canvas/autoLayoutPadding/getAutoLayoutPaddingKey';

type TAutoLayoutPaddingEditor = {
  cancel: TFunc;
  commit: TFunc<[string]>;
  edit: TAutoLayoutPaddingEditDetails | null;
};

export const useAutoLayoutPaddingEditor = (refs: TCanvasRefs): TAutoLayoutPaddingEditor => {
  const editState = useAppSelector(selectEditingAutoLayoutPadding);
  const nodes = useAppSelector(selectNodes);
  const viewport = useAppSelector(selectViewport);
  const dispatch = useAppDispatch();
  const edit = getAutoLayoutPaddingEditDetails(editState, nodes, viewport);

  useEffect(() => {
    refs.transform.autoLayoutPaddingEditRef.current = editState;
  }, [editState, refs]);

  const stop = useCallback((): void => {
    if (editState) {
      dispatch(stopAutoLayoutPaddingEdit({ frameId: editState.frameId, side: editState.side }));
    }
  }, [dispatch, editState]);

  const cancel = useCallback((): void => stop(), [stop]);

  const commit = useCallback(
    (raw: string): void => {
      if (editState) {
        const parsed = parseInt(raw.replace(/[^\d]/g, ''), 10);

        if (!Number.isNaN(parsed)) {
          dispatch(
            updateNode({
              changes: { [getAutoLayoutPaddingKey(editState.side)]: clampAutoLayoutPaddingValue(parsed) },
              id: editState.frameId,
            }),
          );
        }
      }

      stop();
    },
    [dispatch, editState, stop],
  );

  return { cancel, commit, edit };
};
