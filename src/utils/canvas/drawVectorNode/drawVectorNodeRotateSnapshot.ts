// types
import { TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';
import { TVectorNodeRotateSnapshot } from 'types/design/canvas/types';

// utils
import { drawVectorFill } from './drawVectorFill';
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
): void => {
  snapshot.facesByColor.forEach(({ color, points }) => {
    const rotatedFaces = points.map((face) => face.map((point) => rotateSnapshotPoint(point, snapshot)));
    drawVectorFill(gl, program, buffer, rotatedFaces, color, canvasWidth, canvasHeight, viewport);
  });

  const rotatedStrokeVertices: number[] = [];

  for (let index = 0; index < snapshot.strokeVertices.length; index += 2) {
    const rotated = rotateSnapshotPoint({ x: snapshot.strokeVertices[index], y: snapshot.strokeVertices[index + 1] }, snapshot);

    rotatedStrokeVertices.push(rotated.x, rotated.y);
  }

  drawVectorThickStrokeVertices(gl, program, buffer, rotatedStrokeVertices, snapshot.strokeColor, canvasWidth, canvasHeight, viewport);
};
