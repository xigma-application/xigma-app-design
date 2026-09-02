// types
import { TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';
import { TVectorNodeDragSnapshot } from 'types/design/canvas/types';

// utils
import { drawVectorFillPaints } from './drawVectorFillPaints';
import { drawVectorThickStrokeVertices } from './drawVectorThickStrokeVertices';

const translatePoints = (points: TPoint[], deltaX: number, deltaY: number): TPoint[] =>
  points.map((point) => ({ x: point.x + deltaX, y: point.y + deltaY }));

const translateFlatVertices = (vertices: number[], deltaX: number, deltaY: number): number[] =>
  vertices.map((value, index) => value + (index % 2 === 0 ? deltaX : deltaY));

export const drawVectorNodeDragSnapshot = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  snapshot: TVectorNodeDragSnapshot,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const { deltaX, deltaY } = snapshot;

  snapshot.facesByPaint.forEach(({ paint, points }) => {
    const translatedFaces = points.map((face) => translatePoints(face, deltaX, deltaY));
    drawVectorFillPaints(gl, program, buffer, null, null, translatedFaces, paint, canvasWidth, canvasHeight, viewport);
  });

  drawVectorThickStrokeVertices(
    gl,
    program,
    buffer,
    null,
    translateFlatVertices(snapshot.strokeVertices, deltaX, deltaY),
    snapshot.strokeColor,
    canvasWidth,
    canvasHeight,
    viewport,
  );
};
