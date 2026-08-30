import { useCallback, useEffect, useState } from 'react';

// hooks
import { useDoubleClickActivation } from '../../hooks/useDoubleClickActivation/useDoubleClickActivation';

// store
import { selectViewport } from 'store/design/selectors';
import { useAppDispatch, useAppSelector } from 'store';
import { updateNode } from 'store/design/slice';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TViewport } from 'types/design/types';

// utils
import { getFrameNameLabelEditTarget, TFrameNameLabelEdit } from './utils/getFrameNameLabelEditTarget';

type TFrameNameLabelEditor = {
  cancel: TFunc;
  commit: TFunc<[string]>;
  edit: TFrameNameLabelEdit | null;
  viewport: TViewport;
};

export const useFrameNameLabelEditor = (refs: TCanvasRefs): TFrameNameLabelEditor => {
  const [edit, setEdit] = useState<TFrameNameLabelEdit | null>(null);
  const viewport = useAppSelector(selectViewport);
  const dispatch = useAppDispatch();

  useEffect(() => {
    refs.frameName.editingLabelRef.current = edit?.nodeId ?? null;
  }, [edit, refs]);

  const cancel = useCallback((): void => setEdit(null), []);

  const commit = useCallback(
    (raw: string): void => {
      if (edit) {
        const trimmed = raw.trim();

        if (trimmed !== '' && trimmed !== edit.value) {
          dispatch(updateNode({ changes: { name: trimmed }, id: edit.nodeId }));
        }
      }

      setEdit(null);
    },
    [dispatch, edit],
  );

  useDoubleClickActivation(refs, Boolean(edit), getFrameNameLabelEditTarget, setEdit);

  return { cancel, commit, edit, viewport };
};
