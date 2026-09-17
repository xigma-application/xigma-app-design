// types
import { TDrawSceneContext } from '../../../types';
import { TVectorNodeResizeSnapshot } from 'types/design/canvas/types';

// utils
import { drawVectorFillPaints } from 'utils/canvas/drawVectorNode/drawVectorFillPaints';
import { getVectorFillBounds } from 'utils/canvas/drawVectorNode/getVectorFillBounds';
import { scaleFillsCrop } from 'components/Design/Canvas/utils/scaleFillsCrop';
import { scalePoint } from './scalePoint';

export const drawVectorNodeResizeSnapshotFace = (
  context: TDrawSceneContext,
  snapshot: TVectorNodeResizeSnapshot,
  face: TVectorNodeResizeSnapshot['facesByPaint'][number],
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
  const scaledFaces = points.map((facePoints) => facePoints.map((point) => scalePoint(point, snapshot)));
  const localBounds = getVectorFillBounds(points, null);
  const oldCenter = { x: localBounds.x + localBounds.width / 2, y: localBounds.y + localBounds.height / 2 };
  const newCenter = scalePoint(oldCenter, snapshot);
  const scaledWidth = localBounds.width * snapshot.scaleX;
  const scaledHeight = localBounds.height * snapshot.scaleY;
  const { x: x1, y: y1 } = newCenter;
  const { x: x2, y: y2 } = oldCenter;
  const { scaleX: x3, scaleY: y3 } = snapshot;
  const scaledPaint =
    scaleFillsCrop(paint, { newCenterX: x1, newCenterY: y1, oldCenterX: x2, oldCenterY: y2, scaleX: x3, scaleY: y3 }) ?? paint;

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
    scaledFaces,
    scaledPaint,
    [],
    canvasWidth,
    canvasHeight,
    viewport,
    isAlphaWriteEnabled,
    {
      center: newCenter,
      degrees: snapshot.rotation,
      localBounds: { height: scaledHeight, width: scaledWidth, x: newCenter.x - scaledWidth / 2, y: newCenter.y - scaledHeight / 2 },
    },
  );
};
