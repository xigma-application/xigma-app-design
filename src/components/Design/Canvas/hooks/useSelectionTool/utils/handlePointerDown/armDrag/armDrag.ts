import { RefObject } from 'react';

// store
import { selectActivePage, selectAllGuideLines, selectViewport } from 'store/design/selectors';
import { store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TDragState, TPendingClickAction } from 'types/design/selectionTool/types';

// utils
import { captureDraggedVectorNodeSnapshots } from './captureDraggedVectorNodeSnapshots';
import { getCandidateShapes } from 'components/Design/Canvas/utils/getDragAlignmentSnap/getCandidateShapes';
import { getDragNodeOrigins } from './getDragNodeOrigins';
import { getGuideCandidateShapes } from 'components/Design/Canvas/utils/getDragAlignmentSnap/getGuideCandidateShapes';
import { getRigidTransformNodes } from 'store/design/utils/nodeHierarchy/getRigidTransformNodes';
import { getViewportWorldRect } from 'components/Design/Canvas/utils/getViewportWorldRect';

export const armDrag = (
  armIds: string[],
  pendingClickAction: TPendingClickAction | null,
  point: TPoint,
  dragStateRef: RefObject<TDragState | null>,
  canvasRefs: TCanvasRefs,
): void => {
  const state = store.getState();
  const { nodes } = selectActivePage(state);
  const armedNodes = armIds.map((id) => nodes[id]).filter(Boolean);
  const dragIds = getRigidTransformNodes(armedNodes, nodes).map((node) => node.id);
  const canvas = canvasRefs.canvasRef.current;
  const guideCandidateShapes = canvas
    ? getGuideCandidateShapes(selectAllGuideLines(state), getViewportWorldRect(canvas, selectViewport(state)))
    : [];

  dragStateRef.current = {
    candidateShapes: getCandidateShapes(nodes, dragIds).concat(guideCandidateShapes),
    dispatchThrottle: { frameId: null, run: null },
    hasMoved: false,
    nodeOrigins: getDragNodeOrigins(dragIds, nodes),
    pendingClickAction,
    pointerStart: point,
  };

  captureDraggedVectorNodeSnapshots(dragIds, nodes, canvasRefs);
};
