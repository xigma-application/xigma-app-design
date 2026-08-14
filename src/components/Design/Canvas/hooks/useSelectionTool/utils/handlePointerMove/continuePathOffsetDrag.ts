import { RefObject } from 'react';

// store
import { updateNode } from 'store/design/slice';
import { selectNodes, selectViewport } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TPathOffsetDragState } from '../../types';
import { TPoint } from 'types/canvas';

// utils
import { buildEllipseArcLengthTable } from 'utils/canvas/shapes/buildEllipseArcLengthTable';
import { flipTextPoint } from 'utils/canvas/text/flipTextPoint';
import { getNearestEllipsePathOffset } from 'utils/canvas/shapes/getNearestEllipsePathOffset/getNearestEllipsePathOffset';
import { getPointerPosition } from '../../../../utils/getPointerPosition';
import { rotatePoint } from 'utils/math/rotatePoint';
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
      const center: TPoint = { x: node.x + node.width / 2, y: node.y + node.height / 2 };
      const unrotated = rotatePoint(point, center, -node.rotation);
      const localPoint = flipTextPoint(unrotated, node);
      const nearest = getNearestEllipsePathOffset(localPoint, { ...node, rotation: 0 }, table);

      dispatch(updateNode({ changes: { pathStartOffset: nearest.offset }, id: dragState.nodeId }));
    }
  }
};
