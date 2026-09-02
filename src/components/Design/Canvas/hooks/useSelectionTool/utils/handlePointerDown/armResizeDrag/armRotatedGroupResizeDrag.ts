import { RefObject } from 'react';

// types
import { TDraftRect, TResizeHandle } from 'types/canvas';
import { TGroupNode } from 'types/design/types';
import { TResizeDragState, TResizeNodeOrigin } from 'types/design/selectionTool/types';

// store
import { selectActivePage, selectAllGuideLines, selectViewport } from 'store/design/selectors';
import { store } from 'store';

// utils
import { getCandidateShapes } from 'components/Design/Canvas/utils/getDragAlignmentSnap/getCandidateShapes';
import { getGroupSubtreeNodes } from 'store/design/utils/nodeHierarchy/getGroupSubtreeNodes';
import { getGuideCandidateShapes } from 'components/Design/Canvas/utils/getDragAlignmentSnap/getGuideCandidateShapes';
import { getResizeNodeOrigin } from './getResizeNodeOrigin';
import { getViewportWorldRect } from 'components/Design/Canvas/utils/getViewportWorldRect';

export const armRotatedGroupResizeDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  resizeDragRef: RefObject<TResizeDragState | null>,
  group: TGroupNode,
  handle: TResizeHandle,
  bounds: TDraftRect,
): void => {
  const state = store.getState();
  const nodes = selectActivePage(state).nodes;
  const rotatedGroupChildOrigins: Record<string, TResizeNodeOrigin> = {};

  getGroupSubtreeNodes(group, nodes)
    .filter((node) => node.id !== group.id)
    .forEach((node) => {
      rotatedGroupChildOrigins[node.id] = getResizeNodeOrigin(node);
    });

  const guideCandidateShapes = getGuideCandidateShapes(selectAllGuideLines(state), getViewportWorldRect(canvas, selectViewport(state)));

  resizeDragRef.current = {
    aspectRatio: bounds.width / bounds.height,
    bounds,
    candidateShapes: getCandidateShapes(nodes, [group.id]).concat(guideCandidateShapes),
    handle,
    nodeOrigins: { [group.id]: getResizeNodeOrigin(group) },
    rotatedGroupChildOrigins,
  };
  canvas.setPointerCapture(event.pointerId);
};
