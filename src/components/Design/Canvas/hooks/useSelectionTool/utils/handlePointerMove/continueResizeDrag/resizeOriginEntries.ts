// store
import { AppDispatch } from 'store';

// types
import { TResizeNodeOrigin } from 'types/design/selectionTool/types';
import { TVectorNodeResizeSnapshot } from 'types/design/canvas/types';

// utils
import { resizeNode } from './resizeNode/resizeNode';
import { TResizeDragFrame } from './getResizeDragFrame';
import { updateResizedVectorNodeSnapshot } from './updateResizedVectorNodeSnapshot';

export const resizeOriginEntries = (
  originEntries: [string, TResizeNodeOrigin][],
  dispatch: AppDispatch,
  frame: TResizeDragFrame,
  isSingleBoxOrigin: boolean,
  snapshots: Map<string, TVectorNodeResizeSnapshot> | null,
): void => {
  const { anchors, rotatedAnchorSolver, scaleX, scaleY } = frame;

  originEntries.forEach(([id, origin]) => {
    const snapshot = snapshots?.get(id);

    if (snapshot && 'vertices' in origin) {
      updateResizedVectorNodeSnapshot(snapshot, origin, anchors, scaleX, scaleY, rotatedAnchorSolver);
    } else {
      resizeNode(id, origin, dispatch, anchors, scaleX, scaleY, isSingleBoxOrigin, rotatedAnchorSolver);
    }
  });
};
