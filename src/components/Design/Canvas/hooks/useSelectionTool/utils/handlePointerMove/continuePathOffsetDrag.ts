import { RefObject } from 'react';

// store
import { updateNode } from 'store/design/slice';
import { selectNodes, selectViewport } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TPathOffsetDragState } from '../../types';

// utils
import { buildEllipseArcLengthTable } from 'utils/canvas/shapes/buildEllipseArcLengthTable';
import { getNearestEllipsePathOffset } from 'utils/canvas/shapes/getNearestEllipsePathOffset/getNearestEllipsePathOffset';
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
      const table = buildEllipseArcLengthTable(node.width, node.height);
      const nearest = getNearestEllipsePathOffset(point, node, table);

      dispatch(updateNode({ changes: { pathStartOffset: nearest.offset }, id: dragState.nodeId }));
    }
  }
};
