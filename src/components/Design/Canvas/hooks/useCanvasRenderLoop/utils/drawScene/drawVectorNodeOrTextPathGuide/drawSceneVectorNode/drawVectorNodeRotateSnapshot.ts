// types
import { TDrawSceneContext } from '../../types';
import { TPoint } from 'types/canvas';
import { TVectorNodeRotateSnapshot } from 'types/design/canvas/types';

// utils
import { drawVectorFillPaints } from 'utils/canvas/drawVectorNode/drawVectorFillPaints';
import { drawVectorThickStrokeVertices } from 'utils/canvas/drawVectorNode/drawVectorThickStrokeVertices';
import { rotatePoint } from 'utils/math/rotatePoint';

const rotateSnapshotPoint = (point: TPoint, snapshot: TVectorNodeRotateSnapshot): TPoint =>
  rotatePoint(point, snapshot.pivot, snapshot.deltaDegrees);

export const drawVectorNodeRotateSnapshot = (context: TDrawSceneContext, snapshot: TVectorNodeRotateSnapshot): void => {
  const { buffer, canvasHeight, canvasWidth, gl, imageContext, program, viewport } = context;
  const { isAlphaWriteEnabled } = imageContext;
  const rotatedStrokeVertices: number[] = [];

  snapshot.facesByPaint.forEach(({ paint, points }) => {
    const rotatedFaces = points.map((face) => face.map((point) => rotateSnapshotPoint(point, snapshot)));
    drawVectorFillPaints(gl, program, buffer, null, null, rotatedFaces, paint, canvasWidth, canvasHeight, viewport, isAlphaWriteEnabled);
  });

  for (let index = 0; index < snapshot.strokeVertices.length; index += 2) {
    const rotated = rotateSnapshotPoint({ x: snapshot.strokeVertices[index], y: snapshot.strokeVertices[index + 1] }, snapshot);
    rotatedStrokeVertices.push(rotated.x, rotated.y);
  }

  drawVectorThickStrokeVertices(
    gl,
    program,
    buffer,
    null,
    rotatedStrokeVertices,
    snapshot.strokeColor,
    canvasWidth,
    canvasHeight,
    viewport,
  );
};
