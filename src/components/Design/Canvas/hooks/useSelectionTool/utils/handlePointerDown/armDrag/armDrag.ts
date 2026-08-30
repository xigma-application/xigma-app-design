import { RefObject } from 'react';

// store
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TDragState, TPendingClickAction } from 'types/design/selectionTool/types';

// utils
import { captureDraggedVectorNodeSnapshots } from './captureDraggedVectorNodeSnapshots';
import { getCandidateShapes } from 'components/Design/Canvas/utils/getDragAlignmentSnap/getCandidateShapes';
import { getDragNodeOrigins } from './getDragNodeOrigins';
import { getRigidTransformNodes } from 'store/design/utils/nodeHierarchy/getRigidTransformNodes';

export const armDrag = (
  armIds: string[],
  pendingClickAction: TPendingClickAction | null,
  point: TPoint,
  dragStateRef: RefObject<TDragState | null>,
  canvasRefs: TCanvasRefs,
): void => {
  const { nodes } = selectActivePage(store.getState());
  const armedNodes = armIds.map((id) => nodes[id]).filter(Boolean);
  const dragIds = getRigidTransformNodes(armedNodes, nodes).map((node) => node.id);

  dragStateRef.current = {
    candidateShapes: getCandidateShapes(nodes, dragIds),
    dispatchThrottle: { frameId: null, run: null },
    hasMoved: false,
    nodeOrigins: getDragNodeOrigins(dragIds, nodes),
    pendingClickAction,
    pointerStart: point,
  };

  captureDraggedVectorNodeSnapshots(dragIds, nodes, canvasRefs);
};
