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
import { getDragNodeOrigins } from './getDragNodeOrigins';

export const armDrag = (
  armIds: string[],
  pendingClickAction: TPendingClickAction | null,
  point: TPoint,
  dragStateRef: RefObject<TDragState | null>,
  canvasRefs: TCanvasRefs,
): void => {
  const { nodes } = selectActivePage(store.getState());

  dragStateRef.current = {
    dispatchThrottle: { frameId: null, run: null },
    hasMoved: false,
    nodeOrigins: getDragNodeOrigins(armIds, nodes),
    pendingClickAction,
    pointerStart: point,
  };

  captureDraggedVectorNodeSnapshots(armIds, nodes, canvasRefs);
};
