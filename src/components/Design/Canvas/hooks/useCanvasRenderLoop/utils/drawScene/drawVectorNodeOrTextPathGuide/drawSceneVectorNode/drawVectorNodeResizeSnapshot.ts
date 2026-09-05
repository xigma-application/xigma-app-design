// types
import { TDrawSceneContext } from '../../types';
import { TPoint } from 'types/canvas';
import { TVectorNodeResizeSnapshot } from 'types/design/canvas/types';

// utils
import { drawVectorFillPaints } from 'utils/canvas/drawVectorNode/drawVectorFillPaints';
import { drawVectorThickStrokeVertices } from 'utils/canvas/drawVectorNode/drawVectorThickStrokeVertices';
import { getThickVectorPathVertices } from 'utils/canvas/vectorNetwork/getThickVectorPathVertices/getThickVectorPathVertices';
import { rotatePoint } from 'utils/math/rotatePoint';

const scaleAxis = (value: number, anchor: number | null, scale: number): number =>
  anchor === null ? value : anchor + (value - anchor) * scale;

const scalePoint = (point: TPoint, snapshot: TVectorNodeResizeSnapshot): TPoint => {
  const scaled = { x: scaleAxis(point.x, snapshot.anchorX, snapshot.scaleX), y: scaleAxis(point.y, snapshot.anchorY, snapshot.scaleY) };

  if (snapshot.rotation) {
    const shifted = {
      x: scaled.x - snapshot.scaledCenter.x + snapshot.pivot.x,
      y: scaled.y - snapshot.scaledCenter.y + snapshot.pivot.y,
    };

    return rotatePoint(shifted, snapshot.pivot, snapshot.rotation);
  }

  return scaled;
};

export const drawVectorNodeResizeSnapshot = (context: TDrawSceneContext, snapshot: TVectorNodeResizeSnapshot): void => {
  const { buffer, canvasHeight, canvasWidth, gl, imageContext, program, viewport } = context;
  const { isAlphaWriteEnabled } = imageContext;

  snapshot.facesByPaint.forEach(({ paint, points }) => {
    const scaledFaces = points.map((face) => face.map((point) => scalePoint(point, snapshot)));
    drawVectorFillPaints(gl, program, buffer, null, null, scaledFaces, paint, canvasWidth, canvasHeight, viewport, isAlphaWriteEnabled);
  });

  const scaledSegments = snapshot.flattenedSegments.map((segment) => ({
    ...segment,
    points: segment.points.map((point) => scalePoint(point, snapshot)),
  }));
  const strokeVertices = getThickVectorPathVertices(scaledSegments, snapshot.strokeWidth / 2);

  drawVectorThickStrokeVertices(gl, program, buffer, null, strokeVertices, snapshot.strokeColor, canvasWidth, canvasHeight, viewport);
};
