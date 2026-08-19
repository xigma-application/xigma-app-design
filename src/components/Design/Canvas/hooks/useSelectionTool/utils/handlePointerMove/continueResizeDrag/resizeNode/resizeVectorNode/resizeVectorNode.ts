// store
import { updateNode } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { TPoint } from 'types/canvas';
import { TVectorNodeOrigin } from 'types/design/selectionTool/types';

// utils
import { getAnchorCorrectionDelta } from './getAnchorCorrectionDelta';
import { resizeVectorSegments } from './resizeVectorSegments';
import { resizeVectorVertices } from './resizeVectorVertices';
import { translateVertices } from './translateVertices';

export const resizeVectorNode = (
  id: string,
  origin: TVectorNodeOrigin,
  dispatch: AppDispatch,
  anchors: { x: number | null; y: number | null },
  scaleX: number,
  scaleY: number,
  rotatedAnchorSolver: ((width: number, height: number) => TPoint) | null,
): void => {
  const segments = resizeVectorSegments(origin.segments, scaleX, scaleY);
  const vertices = resizeVectorVertices(origin.vertices, anchors, scaleX, scaleY, !rotatedAnchorSolver);

  if (rotatedAnchorSolver) {
    const delta = getAnchorCorrectionDelta(origin, segments, vertices, scaleX, scaleY, rotatedAnchorSolver);
    dispatch(updateNode({ changes: { segments, vertices: translateVertices(vertices, delta) }, id }));

    return;
  }

  dispatch(updateNode({ changes: { segments, vertices }, id }));
};
