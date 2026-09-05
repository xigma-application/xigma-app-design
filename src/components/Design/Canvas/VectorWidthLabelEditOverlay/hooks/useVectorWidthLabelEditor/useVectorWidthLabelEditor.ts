import { useCallback, useEffect, useState } from 'react';

// store
import { selectActivePage, selectActiveTool, selectViewport } from 'store/design/selectors';
import { store, useAppDispatch, useAppSelector } from 'store';
import { updateNode } from 'store/design/slice';

// types
import { ToolName } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TVectorWidthLabelEdit, TVectorWidthLabelEditor } from './types';

// utils
import { getWidthProfileCommitChanges } from './getWidthProfileCommitChanges';
import { handleDoubleClick } from './handleDoubleClick';

export const useVectorWidthLabelEditor = (refs: TCanvasRefs): TVectorWidthLabelEditor => {
  const [edit, setEdit] = useState<TVectorWidthLabelEdit | null>(null);
  const activeTool = useAppSelector(selectActiveTool);
  const viewport = useAppSelector(selectViewport);
  const dispatch = useAppDispatch();
  const cancel = useCallback((): void => setEdit(null), []);

  const commit = useCallback(
    (raw: string): void => {
      if (edit) {
        const result = getWidthProfileCommitChanges(edit, raw, selectActivePage(store.getState()).nodes);

        if (result) {
          dispatch(updateNode(result));
        }
      }

      setEdit(null);
    },
    [dispatch, edit],
  );

  useEffect(() => {
    refs.vectorWidth.editingWidthLabelRef.current = edit ? { nodeId: edit.nodeId, pointId: edit.pointId } : null;
  }, [edit, refs]);

  useEffect(() => {
    const canvas = refs.canvasRef.current;

    if (canvas && activeTool === ToolName.variableWidth) {
      const onDoubleClick = (event: MouseEvent): void => handleDoubleClick(canvas, event, refs, setEdit);
      canvas.addEventListener('dblclick', onDoubleClick);

      return (): void => canvas.removeEventListener('dblclick', onDoubleClick);
    }
  }, [activeTool, refs]);

  return { cancel, commit, edit, viewport };
};
