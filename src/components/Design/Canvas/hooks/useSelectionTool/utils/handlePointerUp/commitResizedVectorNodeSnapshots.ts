// store
import { updateNode } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TResizeDragState } from 'types/design/selectionTool/types';

// utils
import { resizeVectorSegments } from '../handlePointerMove/continueResizeDrag/resizeNode/resizeVectorNode/resizeVectorSegments';
import { resizeVectorVertices } from '../handlePointerMove/continueResizeDrag/resizeNode/resizeVectorNode/resizeVectorVertices';

export const commitResizedVectorNodeSnapshots = (
  dispatch: AppDispatch,
  resizeDragState: TResizeDragState,
  canvasRefs: TCanvasRefs,
): void => {
  const snapshots = canvasRefs.resizedVectorNodeSnapshotsRef.current;

  if (snapshots) {
    snapshots.forEach((snapshot, id) => {
      const origin = resizeDragState.nodeOrigins[id];

      if (origin && 'vertices' in origin) {
        const segments = resizeVectorSegments(origin.segments, snapshot.scaleX, snapshot.scaleY);
        const vertices = resizeVectorVertices(
          origin.vertices,
          { x: snapshot.anchorX, y: snapshot.anchorY },
          snapshot.scaleX,
          snapshot.scaleY,
          true,
        );

        dispatch(updateNode({ changes: { segments, vertices }, id }));
      }
    });

    canvasRefs.resizedVectorNodeSnapshotsRef.current = null;
  }
};
