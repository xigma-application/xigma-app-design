// types
import { TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';
import { TVectorNodeResizeSnapshot } from 'types/design/canvas/types';

// utils
import { drawVectorFill } from './drawVectorFill';
import { drawVectorThickStrokeVertices } from './drawVectorThickStrokeVertices';
import { getThickVectorPathVertices } from '../vectorNetwork/getThickVectorPathVertices/getThickVectorPathVertices';
import { rotatePoint } from 'utils/math/rotatePoint';

const scaleAxis = (value: number, anchor: number | null, scale: number): number =>
  anchor === null ? value : anchor + (value - anchor) * scale;

const scalePoint = (point: TPoint, snapshot: TVectorNodeResizeSnapshot): TPoint => {
  const scaled = { x: scaleAxis(point.x, snapshot.anchorX, snapshot.scaleX), y: scaleAxis(point.y, snapshot.anchorY, snapshot.scaleY) };

  if (!snapshot.rotation) {
    return scaled;
  }

  const shifted = {
    x: scaled.x - snapshot.scaledCenter.x + snapshot.pivot.x,
    y: scaled.y - snapshot.scaledCenter.y + snapshot.pivot.y,
  };

  return rotatePoint(shifted, snapshot.pivot, snapshot.rotation);
};

export const drawVectorNodeResizeSnapshot = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  snapshot: TVectorNodeResizeSnapshot,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  snapshot.facesByColor.forEach(({ color, points }) => {
    const scaledFaces = points.map((face) => face.map((point) => scalePoint(point, snapshot)));
    drawVectorFill(gl, program, buffer, null, scaledFaces, color, canvasWidth, canvasHeight, viewport);
  });

  const scaledSegments = snapshot.flattenedSegments.map((segment) => ({
    ...segment,
    points: segment.points.map((point) => scalePoint(point, snapshot)),
  }));
  const strokeVertices = getThickVectorPathVertices(scaledSegments, snapshot.strokeWidth / 2);

  drawVectorThickStrokeVertices(gl, program, buffer, strokeVertices, snapshot.strokeColor, canvasWidth, canvasHeight, viewport);
};
