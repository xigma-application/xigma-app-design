// types
import { TDrawSceneContext } from '../../../types';
import { TVectorNodeRotateSnapshot } from 'types/design/canvas/types';

// utils
import { drawVectorFillPaints } from 'utils/canvas/drawVectorNode/drawVectorFillPaints';
import { getVectorFillBounds } from 'utils/canvas/drawVectorNode/getVectorFillBounds';
import { rotateFillsCrop } from 'components/Design/Canvas/utils/rotateFillsCrop';
import { rotateSnapshotPoint } from './rotateSnapshotPoint';

export const drawVectorNodeRotateSnapshotFace = (
  context: TDrawSceneContext,
  snapshot: TVectorNodeRotateSnapshot,
  face: TVectorNodeRotateSnapshot['facesByPaint'][number],
): void => {
  const { buffer, canvasHeight, canvasWidth, gl, imageContext, program, viewport } = context;
  const {
    cache: imageTextureCache,
    gradientProgram,
    imagePaintTextureSizeCache,
    isAlphaWriteEnabled,
    patternTileProgram,
    program: imageProgram,
  } = imageContext;
  const { paint, points } = face;
  const rotatedFaces = points.map((facePoints) => facePoints.map((point) => rotateSnapshotPoint(point, snapshot)));
  const localBounds = getVectorFillBounds(points, null);
  const rotatedPaint = rotateFillsCrop(paint, snapshot.pivot, snapshot.deltaDegrees) ?? paint;

  drawVectorFillPaints(
    gl,
    program,
    gradientProgram,
    patternTileProgram,
    imageProgram,
    imageTextureCache,
    imagePaintTextureSizeCache,
    buffer,
    null,
    null,
    rotatedFaces,
    rotatedPaint,
    [],
    canvasWidth,
    canvasHeight,
    viewport,
    isAlphaWriteEnabled,
    { center: snapshot.pivot, degrees: snapshot.deltaDegrees, localBounds },
  );
};
