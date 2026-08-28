// others
import { MIN_DRAG_DISTANCE_PX } from '../../../../constants';

// store
import { selectViewport } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TSelectionToolRefs } from 'types/design/selectionTool/types';

// utils
import { commitVectorCornerHandleDrag } from '../../../../utils/commitVectorCornerHandleDrag';
import { getAngleBetweenPoints } from 'utils/math/getAngleBetweenPoints';
import { getPointerPosition } from '../../../../utils/getPointerPosition';
import { getVectorEditingNode } from '../../../../utils/getVectorEditingNode';
import { pickClosestAngleMatch } from 'utils/math/pickClosestAngleMatch';
import { screenToWorld } from '../../../../utils/screenToWorld';

export const resolveVectorCornerHandleDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  canvasRefs: TCanvasRefs,
  selectionRefs: TSelectionToolRefs,
): void => {
  const pendingState = selectionRefs.pendingVectorCornerHandleDragRef.current;

  if (pendingState) {
    const state = store.getState();
    const node = getVectorEditingNode(state.design.pages[state.design.activePageId].nodes, pendingState.nodeId);

    if (node) {
      const viewport = selectViewport(state);
      const point = screenToWorld(getPointerPosition(canvas, event), viewport);
      const dx = point.x - pendingState.dragStart.x;
      const dy = point.y - pendingState.dragStart.y;

      if (Math.hypot(dx, dy) >= MIN_DRAG_DISTANCE_PX / viewport.zoom) {
        const candidate = pickClosestAngleMatch(pendingState.candidates, getAngleBetweenPoints(pendingState.dragStart, point));

        commitVectorCornerHandleDrag(node, pendingState.vertexId, candidate, dispatch, canvasRefs, selectionRefs.vectorHandleDragRef);
        selectionRefs.pendingVectorCornerHandleDragRef.current = null;
      }
    }
  }
};
