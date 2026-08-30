import { RefObject } from 'react';

// types
import { NodeType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDraftRect, TResizeHandle } from 'types/canvas';
import { TResizeDragState } from 'types/design/selectionTool/types';
import { TSceneNode } from 'types/design/types';

// utils
import { armPlainResizeDrag } from './armPlainResizeDrag';
import { armRotatedGroupResizeDrag } from './armRotatedGroupResizeDrag';

export const armResizeDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  resizeDragRef: RefObject<TResizeDragState | null>,
  selectedNodes: TSceneNode[],
  handle: TResizeHandle,
  bounds: TDraftRect,
  canvasRefs: TCanvasRefs,
): void => {
  const [onlyNode] = selectedNodes;
  const isRotatedGroup = selectedNodes.length === 1 && onlyNode.type === NodeType.group && onlyNode.rotation !== 0;

  if (isRotatedGroup) {
    armRotatedGroupResizeDrag(canvas, event, resizeDragRef, onlyNode, handle, bounds);
  } else {
    armPlainResizeDrag(canvas, event, resizeDragRef, selectedNodes, handle, bounds, canvasRefs);
  }
};
