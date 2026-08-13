import { RefObject } from 'react';

// types
import { NodeType } from 'types/design/enums';
import { TDraftRect, TPoint } from 'types/canvas';
import { TRotateDragState, TRotateNodeOrigin } from '../../types';
import { TSceneNode } from 'types/design/types';

// utils
import { getAngleBetweenPoints } from 'utils/math/getAngleBetweenPoints';
import { getRotateCursorAngle } from 'utils/math/getRotateCursorAngle';

export const armRotateDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  rotateDragRef: RefObject<TRotateDragState | null>,
  selectedNodes: TSceneNode[],
  bounds: TDraftRect,
  rotation: number,
  point: TPoint,
): void => {
  const pivot: TPoint = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
  const nodeOrigins: Record<string, TRotateNodeOrigin> = {};

  selectedNodes.forEach((node) => {
    nodeOrigins[node.id] =
      node.type === NodeType.line
        ? { x1: node.x1, x2: node.x2, y1: node.y1, y2: node.y2 }
        : { height: node.height, rotation: node.rotation, width: node.width, x: node.x, y: node.y };
  });

  rotateDragRef.current = {
    cursorAngle: getRotateCursorAngle(point, bounds, rotation),
    nodeOrigins,
    pivot,
    startAngle: getAngleBetweenPoints(pivot, point),
  };
  canvas.setPointerCapture(event.pointerId);
};
