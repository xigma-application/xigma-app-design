import { useCallback, useEffect, useState } from 'react';

// hooks
import { useActiveViewport } from 'hooks/useActiveViewport/useActiveViewport';
import { useDoubleClickActivation } from '../../hooks/useDoubleClickActivation/useDoubleClickActivation';

// store
import { useAppDispatch } from 'store';
import { updateNode } from 'store/design/slice';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TViewport } from 'types/design/types';

// utils
import { getSectionNameLabelEditTarget, TSectionNameLabelEdit } from './utils/getSectionNameLabelEditTarget';

type TSectionNameLabelEditor = {
  cancel: TFunc;
  commit: TFunc<[string]>;
  edit: TSectionNameLabelEdit | null;
  viewport: TViewport;
};

export const useSectionNameLabelEditor = (refs: TCanvasRefs): TSectionNameLabelEditor => {
  const [edit, setEdit] = useState<TSectionNameLabelEdit | null>(null);
  const viewport = useActiveViewport(edit !== null);
  const dispatch = useAppDispatch();

  useEffect(() => {
    refs.sectionName.editingLabelRef.current = edit?.nodeId ?? null;
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

  useDoubleClickActivation(refs, Boolean(edit), getSectionNameLabelEditTarget, setEdit);

  return { cancel, commit, edit, viewport };
};
