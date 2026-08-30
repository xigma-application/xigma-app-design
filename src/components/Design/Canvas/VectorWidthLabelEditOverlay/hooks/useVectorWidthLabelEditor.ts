import { useCallback, useEffect, useState } from 'react';

// store
import { selectActivePage, selectActiveTool, selectViewport } from 'store/design/selectors';
import { store, useAppDispatch, useAppSelector } from 'store';
import { updateNode } from 'store/design/slice';

// types
import { NodeType, ToolName } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { getPointerPosition } from '../../utils/getPointerPosition';
import { getVectorWidthLabelRects, isPointInVectorWidthLabelRect } from '../../utils/getVectorWidthLabelRects';
import { screenToWorld } from '../../utils/screenToWorld';

export type TVectorWidthLabelEdit = {
  badgeHeight: number;
  badgeWidth: number;
  center: TPoint;
  nodeId: string;
  pointId: string;
  value: number;
};

type TVectorWidthLabelEditor = {
  cancel: TFunc;
  commit: TFunc<[string]>;
  edit: TVectorWidthLabelEdit | null;
  viewport: TViewport;
};

export const useVectorWidthLabelEditor = (refs: TCanvasRefs): TVectorWidthLabelEditor => {
  const [edit, setEdit] = useState<TVectorWidthLabelEdit | null>(null);
  const activeTool = useAppSelector(selectActiveTool);
  const viewport = useAppSelector(selectViewport);
  const dispatch = useAppDispatch();

  useEffect(() => {
    refs.vectorWidth.editingWidthLabelRef.current = edit ? { nodeId: edit.nodeId, pointId: edit.pointId } : null;
  }, [edit, refs]);

  useEffect(() => {
    const canvas = refs.canvasRef.current;

    if (!canvas || activeTool !== ToolName.variableWidth) {
      return;
    }

    const onDoubleClick = (event: MouseEvent): void => {
      const state = store.getState();
      const currentViewport = selectViewport(state);
      const point = screenToWorld(getPointerPosition(canvas, event), currentViewport);
      const nodes = selectActivePage(state).nodes;
      const rect = getVectorWidthLabelRects(refs, nodes, currentViewport.zoom).find((candidate) =>
        isPointInVectorWidthLabelRect(point, candidate),
      );

      if (rect) {
        event.preventDefault();
        event.stopPropagation();
        setEdit({
          badgeHeight: rect.badgeHeight,
          badgeWidth: rect.badgeWidth,
          center: rect.center,
          nodeId: rect.target.nodeId,
          pointId: rect.target.point.id,
          value: Math.round(rect.target.point.leftOffset + rect.target.point.rightOffset),
        });
      }
    };

    canvas.addEventListener('dblclick', onDoubleClick);

    return (): void => canvas.removeEventListener('dblclick', onDoubleClick);
  }, [activeTool, refs]);

  const cancel = useCallback((): void => setEdit(null), []);

  const commit = useCallback(
    (raw: string): void => {
      if (edit) {
        const trimmed = raw.trim();
        const next = Number(trimmed);

        if (trimmed !== '' && Number.isFinite(next) && next >= 0 && next !== edit.value) {
          const node = selectActivePage(store.getState()).nodes[edit.nodeId];

          if (node && node.type === NodeType.vector && node.widthProfile?.points[edit.pointId]) {
            const halfWidth = next / 2;

            dispatch(
              updateNode({
                changes: {
                  widthProfile: {
                    points: {
                      ...node.widthProfile.points,
                      [edit.pointId]: { ...node.widthProfile.points[edit.pointId], leftOffset: halfWidth, rightOffset: halfWidth },
                    },
                  },
                },
                id: edit.nodeId,
              }),
            );
          }
        }
      }

      setEdit(null);
    },
    [dispatch, edit],
  );

  return { cancel, commit, edit, viewport };
};
