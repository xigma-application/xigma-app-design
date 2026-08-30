import { RefObject } from 'react';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDraftRect, TResizeHandle } from 'types/canvas';
import { TResizeDragState, TResizeNodeOrigin } from 'types/design/selectionTool/types';
import { TSceneNode } from 'types/design/types';

// store
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// utils
import { captureResizedVectorNodeSnapshots } from '../captureResizedVectorNodeSnapshots';
import { getCandidateShapes } from 'components/Design/Canvas/utils/getDragAlignmentSnap/getCandidateShapes';
import { getResizeNodeOrigin } from './getResizeNodeOrigin';
import { getTransformTargetNodes } from 'store/design/utils/nodeHierarchy/getTransformTargetNodes';

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
  const nodes = selectActivePage(store.getState()).nodes;
  const targetNodes = getTransformTargetNodes(selectedNodes, nodes);

  targetNodes.forEach((node) => {
    nodeOrigins[node.id] = getResizeNodeOrigin(node);
  });

  resizeDragRef.current = {
    aspectRatio: bounds.width / bounds.height,
    bounds,
    candidateShapes: getCandidateShapes(nodes, Object.keys(nodeOrigins)),
    handle,
    nodeOrigins,
  };
  captureResizedVectorNodeSnapshots(targetNodes, canvasRefs);
  canvas.setPointerCapture(event.pointerId);
};
