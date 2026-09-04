// types
import { TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';
import { TVectorNodeRotateSnapshot } from 'types/design/canvas/types';

// utils
import { drawVectorFillPaints } from './drawVectorFillPaints';
import { drawVectorThickStrokeVertices } from './drawVectorThickStrokeVertices';
import { rotatePoint } from 'utils/math/rotatePoint';

const rotateSnapshotPoint = (point: TPoint, snapshot: TVectorNodeRotateSnapshot): TPoint =>
  rotatePoint(point, snapshot.pivot, snapshot.deltaDegrees);

export const drawVectorNodeRotateSnapshot = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  snapshot: TVectorNodeRotateSnapshot,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
  isAlphaWriteEnabled: boolean,
): void => {
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
