import { RefObject } from 'react';

// store
import { updateNode } from 'store/design/slice';
import { selectNodes, selectViewport } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TPathOffsetDragState } from 'types/design/selectionTool/types';

// utils
import { getNearestPathOffsetAtPoint } from 'utils/canvas/shapes/getNearestPathOffsetAtPoint';
import { getPointerPosition } from '../../../../utils/getPointerPosition';
import { screenToWorld } from '../../../../utils/screenToWorld';

export const continuePathOffsetDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  pathOffsetDragRef: RefObject<TPathOffsetDragState | null>,
): void => {
  const dragState = pathOffsetDragRef.current;

  if (dragState) {
    const state = store.getState();
    const node = selectNodes(state)[dragState.nodeId];

    if (node && node.type === NodeType.text) {
      const viewport = selectViewport(state);
      const point = screenToWorld(getPointerPosition(canvas, event), viewport);
      const pathNode = node.pathId ? selectNodes(state)[node.pathId] : undefined;
      const offset = getNearestPathOffsetAtPoint(point, node, pathNode);

      dispatch(updateNode({ changes: { pathStartOffset: offset }, id: dragState.nodeId }));
    }
  }
};
