// store
import { updateNode } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDragState } from 'types/design/selectionTool/types';

// utils
import { getGeometryDeltaChanges } from 'components/Design/Canvas/utils/getGeometryDeltaChanges';

export const commitDraggedVectorNodeSnapshots = (dispatch: AppDispatch, dragState: TDragState, canvasRefs: TCanvasRefs): void => {
  const snapshots = canvasRefs.vectorSnapshots.draggedVectorNodeSnapshotsRef.current;

  if (snapshots) {
    snapshots.forEach((snapshot, id) => {
      const origin = dragState.nodeOrigins[id];

      if (origin) {
        dispatch(updateNode({ changes: getGeometryDeltaChanges(origin, snapshot.deltaX, snapshot.deltaY), id }));
      }
    });

    canvasRefs.vectorSnapshots.draggedVectorNodeSnapshotsRef.current = null;
  }
};
