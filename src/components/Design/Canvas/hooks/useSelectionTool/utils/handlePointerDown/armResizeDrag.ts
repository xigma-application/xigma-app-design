import { RefObject } from 'react';

// types
import { NodeType } from 'types/design/enums';
import { TDraftRect, TResizeHandle } from 'types/canvas';
import { TResizeDragState, TResizeNodeOrigin } from '../../types';
import { TSceneNode } from 'types/design/types';

export const armResizeDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  resizeDragRef: RefObject<TResizeDragState | null>,
  selectedNodes: TSceneNode[],
  handle: TResizeHandle,
  bounds: TDraftRect,
): void => {
  const nodeOrigins: Record<string, TResizeNodeOrigin> = {};

  selectedNodes.forEach((node) => {
    nodeOrigins[node.id] =
      node.type === NodeType.line
        ? { x1: node.x1, x2: node.x2, y1: node.y1, y2: node.y2 }
        : { height: node.height, width: node.width, x: node.x, y: node.y };
  });

  resizeDragRef.current = { aspectRatio: bounds.width / bounds.height, bounds, handle, nodeOrigins };
  canvas.setPointerCapture(event.pointerId);
};
