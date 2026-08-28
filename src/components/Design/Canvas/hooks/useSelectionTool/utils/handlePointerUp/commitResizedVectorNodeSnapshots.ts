// store
import { AppDispatch } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TResizeDragState } from 'types/design/selectionTool/types';

// utils
import { getRotatedAnchorSolver } from '../handlePointerMove/continueResizeDrag/getRotatedAnchorSolver';
import { resizeVectorNode } from '../handlePointerMove/continueResizeDrag/resizeNode/resizeVectorNode/resizeVectorNode';

export const commitResizedVectorNodeSnapshots = (
  dispatch: AppDispatch,
  resizeDragState: TResizeDragState,
  canvasRefs: TCanvasRefs,
): void => {
  const snapshots = canvasRefs.vectorSnapshots.resizedVectorNodeSnapshotsRef.current;

  if (snapshots) {
    const isSingleNodeResize = Object.keys(resizeDragState.nodeOrigins).length === 1;

    snapshots.forEach((snapshot, id) => {
      const origin = resizeDragState.nodeOrigins[id];

      if (origin && 'vertices' in origin) {
        const rotatedAnchorSolver =
          isSingleNodeResize && origin.rotation
            ? getRotatedAnchorSolver(resizeDragState.bounds, resizeDragState.handle, origin.rotation, snapshot.scaleX, snapshot.scaleY)
            : null;

        resizeVectorNode(
          id,
          origin,
          dispatch,
          { x: snapshot.anchorX, y: snapshot.anchorY },
          snapshot.scaleX,
          snapshot.scaleY,
          rotatedAnchorSolver,
        );
      }
    });

    canvasRefs.vectorSnapshots.resizedVectorNodeSnapshotsRef.current = null;
  }
};
