// others
import { ELLIPSE_ARC_MAX_RATIO, ELLIPSE_SEGMENTS } from 'constant/canvas';

// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { drawLine } from '../drawLine';
import { getEffectiveArcAngles } from '../ellipseArc/getEffectiveArcAngles';
import { getEllipseArcPoints } from './getEllipseArcPoints';
import { getQuadVertices } from '../getQuadVertices';
import { hasEllipseArc } from '../ellipseArc/hasEllipseArc';
import { hexToRgbaFloat } from '../hexToRgbaFloat';
import { rotatePoint } from 'utils/math/rotatePoint';

const getTransformedArcPoints = (
  bounds: TDraftRect,
  arcStartAngle: number,
  arcEndAngle: number,
  center: TPoint,
  flipX: boolean,
  flipY: boolean,
  rotation: number,
  radiusRatio = 1,
): TPoint[] =>
  getEllipseArcPoints(bounds, arcStartAngle, arcEndAngle, ELLIPSE_SEGMENTS, radiusRatio)
    .map((point) => ({ x: flipX ? 2 * center.x - point.x : point.x, y: flipY ? 2 * center.y - point.y : point.y }))
    .map((point) => rotatePoint(point, center, rotation));

const expandRect = (rect: TDraftRect, amount: number): TDraftRect => ({
  height: rect.height + amount * 2,
  width: rect.width + amount * 2,
  x: rect.x - amount,
  y: rect.y - amount,
});

const getOpenRingVertices = (outerPoints: TPoint[], innerPoints: TPoint[]): number[] =>
  outerPoints
    .slice(0, -1)
    .flatMap((outerPoint, index) =>
      getQuadVertices(
        outerPoint.x,
        outerPoint.y,
        outerPoints[index + 1].x,
        outerPoints[index + 1].y,
        innerPoints[index + 1].x,
        innerPoints[index + 1].y,
        innerPoints[index].x,
        innerPoints[index].y,
      ),
    );

export const drawThickEllipseArcOutline = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  ellipse: TDraftRect & { arcEndAngle: number; arcRatio?: number; arcRatioInverted?: boolean; arcStartAngle: number },
  color: string,
  strokeWidth: number,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
  flipX: boolean,
  flipY: boolean,
  rotation: number,
): void => {
  const positionLocation = gl.getAttribLocation(program, 'a_position');
  const colorLocation = gl.getUniformLocation(program, 'u_color');
  const viewportOffsetLocation = gl.getUniformLocation(program, 'u_viewportOffset');
  const zoomLocation = gl.getUniformLocation(program, 'u_zoom');
  const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
  const halfWidth = strokeWidth / viewport.zoom / 2;
  const center: TPoint = { x: ellipse.x + ellipse.width / 2, y: ellipse.y + ellipse.height / 2 };
  const { arcEndAngle, arcStartAngle } = ellipse;
  const arcRatio = Math.min(Math.max(ellipse.arcRatio ?? 0, 0), ELLIPSE_ARC_MAX_RATIO);
  const { effectiveEndAngle, effectiveStartAngle } = getEffectiveArcAngles(arcStartAngle, arcEndAngle, ellipse.arcRatioInverted ?? false);

  const outerPoints = getTransformedArcPoints(
    expandRect(ellipse, halfWidth),
    effectiveStartAngle,
    effectiveEndAngle,
    center,
    flipX,
    flipY,
    rotation,
  );
  const innerPoints = getTransformedArcPoints(
    expandRect(ellipse, -halfWidth),
    effectiveStartAngle,
    effectiveEndAngle,
    center,
    flipX,
    flipY,
    rotation,
  );
  const rimPoints = getTransformedArcPoints(ellipse, effectiveStartAngle, effectiveEndAngle, center, flipX, flipY, rotation);
  const vertices = getOpenRingVertices(outerPoints, innerPoints);
  const [firstRimPoint] = rimPoints;
  const lastRimPoint = rimPoints[rimPoints.length - 1];

  const holeRect: TDraftRect = {
    height: ellipse.height * arcRatio,
    width: ellipse.width * arcRatio,
    x: center.x - (ellipse.width * arcRatio) / 2,
    y: center.y - (ellipse.height * arcRatio) / 2,
  };
  const holeOuterPoints =
    arcRatio > 0
      ? getTransformedArcPoints(expandRect(holeRect, halfWidth), effectiveStartAngle, effectiveEndAngle, center, flipX, flipY, rotation)
      : null;
  const holeInnerPoints =
    arcRatio > 0
      ? getTransformedArcPoints(expandRect(holeRect, -halfWidth), effectiveStartAngle, effectiveEndAngle, center, flipX, flipY, rotation)
      : null;
  const holeRimPoints =
    arcRatio > 0 ? getTransformedArcPoints(holeRect, effectiveStartAngle, effectiveEndAngle, center, flipX, flipY, rotation) : null;

  if (holeOuterPoints && holeInnerPoints) {
    vertices.push(...getOpenRingVertices(holeOuterPoints, holeInnerPoints));
  }

  const firstSpokeStart = holeRimPoints ? holeRimPoints[0] : center;
  const lastSpokeStart = holeRimPoints ? holeRimPoints[holeRimPoints.length - 1] : center;

  gl.useProgram(program);
  gl.uniform2f(viewportOffsetLocation, viewport.x, viewport.y);
  gl.uniform1f(zoomLocation, viewport.zoom);
  gl.uniform2f(resolutionLocation, canvasWidth, canvasHeight);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  gl.uniform4fv(colorLocation, hexToRgbaFloat(color));
  gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 2);

  if (hasEllipseArc(arcStartAngle, arcEndAngle)) {
    drawLine(
      gl,
      program,
      buffer,
      { x1: firstSpokeStart.x, x2: firstRimPoint.x, y1: firstSpokeStart.y, y2: firstRimPoint.y },
      color,
      strokeWidth / viewport.zoom,
      canvasWidth,
      canvasHeight,
      viewport,
    );
    drawLine(
      gl,
      program,
      buffer,
      { x1: lastSpokeStart.x, x2: lastRimPoint.x, y1: lastSpokeStart.y, y2: lastRimPoint.y },
      color,
      strokeWidth / viewport.zoom,
      canvasWidth,
      canvasHeight,
      viewport,
    );
  }
};
