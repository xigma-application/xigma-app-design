import { RefObject } from 'react';

// store
import { updateNode } from 'store/design/slice';
import { selectActivePage, selectViewport } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TRotateDragState, TRotateNodeOrigin } from 'types/design/selectionTool/types';

// utils
import { getAngleBetweenPoints } from 'utils/math/getAngleBetweenPoints';
import { getPointerPosition } from 'utils/math/pointer/getPointerPosition';
import { getRotatedNodeChanges } from './getRotatedNodeChanges';
import { getRotatedCursorUrl } from 'utils/canvas/createCursorRotator/getRotatedCursorUrl';
import { screenToWorld } from 'utils/transform/screenToWorld';

const pinRotatedGroupBounds = (dispatch: AppDispatch, nodeOrigins: Record<string, TRotateNodeOrigin>): void => {
  const { nodes } = selectActivePage(store.getState());

  Object.entries(nodeOrigins).forEach(([id, origin]) => {
    if (nodes[id]?.type === NodeType.group && 'width' in origin) {
      dispatch(updateNode({ changes: { height: origin.height, width: origin.width }, id }));
    }
  });
};

export const continueRotateDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  rotateDragRef: RefObject<TRotateDragState | null>,
  canvasRefs: TCanvasRefs,
): void => {
  const rotateDragState = rotateDragRef.current;

  if (rotateDragState) {
    const { cursorAngle, nodeOrigins, pivot, startAngle } = rotateDragState;
    const point = screenToWorld(getPointerPosition(canvas, event), selectViewport(store.getState()));
    const deltaDegrees = getAngleBetweenPoints(pivot, point) - startAngle;
    const isSingleNodeRotate = Object.keys(nodeOrigins).length === 1;
    const snapshots = canvasRefs.vectorSnapshots.rotatedVectorNodeSnapshotsRef.current;

    canvas.style.cursor = getRotatedCursorUrl('rotate', cursorAngle + deltaDegrees) ?? canvas.style.cursor;

    if (snapshots && !canvasRefs.transform.rotatedNodeIdsRef.current) {
      canvasRefs.transform.rotatedNodeIdsRef.current = new Set(snapshots.keys());
    }

    Object.entries(nodeOrigins).forEach(([id, origin]) => {
      const snapshot = snapshots?.get(id);

      if (snapshot) {
        snapshot.deltaDegrees = deltaDegrees;
      } else {
        dispatch(updateNode({ changes: getRotatedNodeChanges(origin, pivot, deltaDegrees, isSingleNodeRotate), id }));
      }
    });

    pinRotatedGroupBounds(dispatch, nodeOrigins);
  }
};
