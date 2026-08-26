// store
import { updateNode } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TRotateDragState } from 'types/design/selectionTool/types';

// utils
import { getRotatedNodeChanges } from '../handlePointerMove/continueRotateDrag/getRotatedNodeChanges';

export const commitRotatedVectorNodeSnapshots = (
  dispatch: AppDispatch,
  rotateDragState: TRotateDragState,
  canvasRefs: TCanvasRefs,
): void => {
  const snapshots = canvasRefs.rotatedVectorNodeSnapshotsRef.current;

  if (snapshots) {
    const isSingleNodeRotate = Object.keys(rotateDragState.nodeOrigins).length === 1;

    snapshots.forEach((snapshot, id) => {
      const origin = rotateDragState.nodeOrigins[id];

      if (origin) {
        dispatch(
          updateNode({
            changes: getRotatedNodeChanges(origin, rotateDragState.pivot, snapshot.deltaDegrees, isSingleNodeRotate),
            id,
          }),
        );
      }
    });

    canvasRefs.rotatedVectorNodeSnapshotsRef.current = null;
  }
};
