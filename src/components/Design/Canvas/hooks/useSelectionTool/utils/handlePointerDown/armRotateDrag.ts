import { RefObject } from 'react';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDraftRect, TPoint } from 'types/canvas';
import { TRotateDragState, TRotateNodeOrigin } from 'types/design/selectionTool/types';
import { TSceneNode } from 'types/design/types';

// store
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// utils
import { captureRotatedVectorNodeSnapshot } from './captureRotatedVectorNodeSnapshot';
import { getAngleBetweenPoints } from 'utils/math/getAngleBetweenPoints';
import { getRigidTransformNodes } from 'store/design/utils/nodeHierarchy/getRigidTransformNodes';
import { getRotateCursorAngle } from 'utils/math/getRotateCursorAngle';
import { getRotateNodeOrigins } from './getRotateNodeOrigins';

const commitRotateDragState = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  rotateDragRef: RefObject<TRotateDragState | null>,
  point: TPoint,
  bounds: TDraftRect,
  rotation: number,
  pivot: TPoint,
  nodeOrigins: Record<string, TRotateNodeOrigin>,
): void => {
  rotateDragRef.current = {
    cursorAngle: getRotateCursorAngle(point, bounds, rotation),
    nodeOrigins,
    pivot,
    startAngle: getAngleBetweenPoints(pivot, point),
  };
  canvas.setPointerCapture(event.pointerId);
};

export const armRotateDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  rotateDragRef: RefObject<TRotateDragState | null>,
  selectedNodes: TSceneNode[],
  bounds: TDraftRect,
  rotation: number,
  point: TPoint,
  canvasRefs: TCanvasRefs,
): void => {
  const pivot: TPoint = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
  const targetNodes = getRigidTransformNodes(selectedNodes, selectActivePage(store.getState()).nodes);
  const nodeOrigins = getRotateNodeOrigins(targetNodes);

  commitRotateDragState(canvas, event, rotateDragRef, point, bounds, rotation, pivot, nodeOrigins);
  captureRotatedVectorNodeSnapshot(targetNodes, canvasRefs);
};
