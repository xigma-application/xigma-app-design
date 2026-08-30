import { RefObject } from 'react';

// types
import { TDraftRect, TResizeHandle } from 'types/canvas';
import { TGroupNode } from 'types/design/types';
import { TResizeDragState, TResizeNodeOrigin } from 'types/design/selectionTool/types';

// store
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// utils
import { getGroupSubtreeNodes } from 'store/design/utils/nodeHierarchy/getGroupSubtreeNodes';
import { getResizeNodeOrigin } from './getResizeNodeOrigin';

export const armRotatedGroupResizeDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  resizeDragRef: RefObject<TResizeDragState | null>,
  group: TGroupNode,
  handle: TResizeHandle,
  bounds: TDraftRect,
): void => {
  const nodes = selectActivePage(store.getState()).nodes;
  const rotatedGroupChildOrigins: Record<string, TResizeNodeOrigin> = {};

  getGroupSubtreeNodes(group, nodes)
    .filter((node) => node.id !== group.id)
    .forEach((node) => {
      rotatedGroupChildOrigins[node.id] = getResizeNodeOrigin(node);
    });

  resizeDragRef.current = {
    aspectRatio: bounds.width / bounds.height,
    bounds,
    handle,
    nodeOrigins: { [group.id]: getResizeNodeOrigin(group) },
    rotatedGroupChildOrigins,
  };
  canvas.setPointerCapture(event.pointerId);
};
