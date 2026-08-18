import { RefObject } from 'react';

// types
import { NodeType } from 'types/design/enums';
import { TDraftRect, TResizeHandle } from 'types/canvas';
import { TEllipseNode, TMediaNode, TPolygonNode, TSceneNode, TStarNode, TTextNode } from 'types/design/types';
import { TResizeDragState, TResizeNodeOrigin } from 'types/design/selectionTool/types';

const isFlippableNode = (node: TSceneNode): node is TEllipseNode | TMediaNode | TPolygonNode | TStarNode | TTextNode =>
  node.type === NodeType.ellipse ||
  node.type === NodeType.media ||
  node.type === NodeType.text ||
  node.type === NodeType.polygon ||
  node.type === NodeType.star;

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
        : {
            flip: isFlippableNode(node) ? { x: node.flipX ?? false, y: node.flipY ?? false } : null,
            height: node.height,
            rotation: node.rotation,
            width: node.width,
            x: node.x,
            y: node.y,
          };
  });

  resizeDragRef.current = { aspectRatio: bounds.width / bounds.height, bounds, handle, nodeOrigins };
  canvas.setPointerCapture(event.pointerId);
};
