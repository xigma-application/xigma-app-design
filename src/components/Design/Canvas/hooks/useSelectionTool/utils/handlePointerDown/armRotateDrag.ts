import { RefObject } from 'react';

// types
import { NodeType } from 'types/design/enums';
import { TDraftRect, TPoint } from 'types/canvas';
import { TRotateDragState, TRotateNodeOrigin } from 'types/design/selectionTool/types';
import { TSceneNode } from 'types/design/types';

// utils
import { getAngleBetweenPoints } from 'utils/math/getAngleBetweenPoints';
import { getRotateCursorAngle } from 'utils/math/getRotateCursorAngle';

const getRotateNodeOrigins = (selectedNodes: TSceneNode[]): Record<string, TRotateNodeOrigin> => {
  const nodeOrigins: Record<string, TRotateNodeOrigin> = {};

  selectedNodes.forEach((node) => {
    switch (node.type) {
      case NodeType.line:
        nodeOrigins[node.id] = { x1: node.x1, x2: node.x2, y1: node.y1, y2: node.y2 };
        break;
      case NodeType.vector:
        nodeOrigins[node.id] = { rotation: node.rotation, segments: node.segments, vertices: node.vertices };
        break;
      default:
        nodeOrigins[node.id] = { height: node.height, rotation: node.rotation, width: node.width, x: node.x, y: node.y };
    }
  });

  return nodeOrigins;
};

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
): void => {
  const pivot: TPoint = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
  const nodeOrigins = getRotateNodeOrigins(selectedNodes);

  commitRotateDragState(canvas, event, rotateDragRef, point, bounds, rotation, pivot, nodeOrigins);
};
