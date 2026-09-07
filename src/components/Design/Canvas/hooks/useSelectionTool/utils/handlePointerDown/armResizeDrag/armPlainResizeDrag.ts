import { RefObject } from 'react';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDraftRect, TResizeHandle } from 'types/canvas';
import { TResizeDragState, TResizeNodeOrigin } from 'types/design/selectionTool/types';
import { TSceneNode } from 'types/design/types';

// store
import { selectActivePage, selectAllGuideLines, selectViewport } from 'store/design/selectors';
import { store } from 'store';

// utils
import { captureResizedVectorNodeSnapshots } from '../captureResizedVectorNodeSnapshots';
import { getCandidateShapes } from 'components/Design/Canvas/utils/getDragAlignmentSnap/getCandidateShapes';
import { getGuideCandidateShapes } from 'components/Design/Canvas/utils/getDragAlignmentSnap/getGuideCandidateShapes';
import { getResizeNodeOrigin } from './getResizeNodeOrigin';
import { getTransformTargetNodes } from 'store/design/utils/nodeHierarchy/getTransformTargetNodes';
import { getViewportWorldRect } from 'components/Design/Canvas/utils/getViewportWorldRect';

export const armPlainResizeDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  resizeDragRef: RefObject<TResizeDragState | null>,
  selectedNodes: TSceneNode[],
  handle: TResizeHandle,
  bounds: TDraftRect,
  canvasRefs: TCanvasRefs,
): void => {
  const nodeOrigins: Record<string, TResizeNodeOrigin> = {};
  const state = store.getState();
  const nodes = selectActivePage(state).nodes;
  const targetNodes = getTransformTargetNodes(selectedNodes, nodes);

  targetNodes.forEach((node) => {
    nodeOrigins[node.id] = getResizeNodeOrigin(node);
  });

  const guideCandidateShapes = getGuideCandidateShapes(selectAllGuideLines(state), getViewportWorldRect(canvas, selectViewport(state)));

  resizeDragRef.current = {
    aspectRatio: bounds.width / bounds.height,
    bounds,
    candidateShapes: getCandidateShapes(nodes, Object.keys(nodeOrigins)).concat(guideCandidateShapes),
    handle,
    nodeOrigins,
  };
  captureResizedVectorNodeSnapshots(targetNodes, canvasRefs);
  canvas.setPointerCapture(event.pointerId);
};
