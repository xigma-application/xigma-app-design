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
import { getCandidateShapes, type TCandidateShape } from 'components/Design/Canvas/utils/getDragAlignmentSnap/getCandidateShapes';
import { getDragNodeOrigins } from './getDragNodeOrigins';
import { getGuideCandidateShapes } from 'components/Design/Canvas/utils/getDragAlignmentSnap/getGuideCandidateShapes';
import { getNearestNodeId } from './getNearestNodeId';
import { getRigidTransformNodes } from 'store/design/utils/nodeHierarchy/getRigidTransformNodes';
import { getViewportWorldRect } from 'components/Design/Canvas/utils/getViewportWorldRect';

const getArmDragGuideCandidateShapes = (canvasRefs: TCanvasRefs, state: ReturnType<typeof store.getState>): TCandidateShape[] => {
  const canvas = canvasRefs.canvasRef.current;
  return canvas ? getGuideCandidateShapes(selectAllGuideLines(state), getViewportWorldRect(canvas, selectViewport(state))) : [];
};

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
  const guideCandidateShapes = getArmDragGuideCandidateShapes(canvasRefs, state);
  const clickedNodeId = pendingClickAction?.kind === 'collapse' && armIds.includes(pendingClickAction.id) ? pendingClickAction.id : null;

  dragStateRef.current = {
    candidateShapes: getCandidateShapes(nodes, dragIds).concat(guideCandidateShapes),
    ctrlMarqueeFallback: null,
    dispatchThrottle: { frameId: null, run: null },
    grabbedNodeId: clickedNodeId ?? getNearestNodeId(armIds, nodes, point),
    hasMoved: false,
    nodeOrigins: getDragNodeOrigins(dragIds, nodes),
    pendingClickAction,
    pointerStart: point,
  };

  captureDraggedVectorNodeSnapshots(dragIds, nodes, canvasRefs);
};
