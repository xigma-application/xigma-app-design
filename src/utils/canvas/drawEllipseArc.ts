// others
import { ELLIPSE_ARC_MAX_RATIO, ELLIPSE_SEGMENTS } from 'constant/canvas';

// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { flipPoint } from 'utils/math/flipPoint';
import { getEffectiveArcAngles } from './ellipseArc/getEffectiveArcAngles';
import { getEllipseArcPoints } from './shapes/getEllipseArcPoints';
import { hexToRgbaFloat } from './hexToRgbaFloat';
import { rotatePoint } from 'utils/math/rotatePoint';

export type TDrawableEllipseArc = TDraftRect & {
  arcEndAngle: number;
  arcRatio?: number;
  arcRatioInverted?: boolean;
  arcStartAngle: number;
  fill?: string;
  fillAlpha?: number;
  stroke?: string;
};

export const drawEllipseArc = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  ellipse: TDrawableEllipseArc,
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

  const center: TPoint = { x: ellipse.x + ellipse.width / 2, y: ellipse.y + ellipse.height / 2 };
  const arcRatio = Math.min(Math.max(ellipse.arcRatio ?? 0, 0), ELLIPSE_ARC_MAX_RATIO);
  const { effectiveEndAngle, effectiveStartAngle } = getEffectiveArcAngles(
    ellipse.arcStartAngle,
    ellipse.arcEndAngle,
    ellipse.arcRatioInverted ?? false,
  );
  const outerPoints = getEllipseArcPoints(ellipse, effectiveStartAngle, effectiveEndAngle, ELLIPSE_SEGMENTS)
    .map((point) => flipPoint(point, center, flipX, flipY))
    .map((point) => rotatePoint(point, center, rotation));
  const innerPoints =
    arcRatio > 0
      ? getEllipseArcPoints(ellipse, effectiveStartAngle, effectiveEndAngle, ELLIPSE_SEGMENTS, arcRatio)
          .map((point) => flipPoint(point, center, flipX, flipY))
          .map((point) => rotatePoint(point, center, rotation))
      : null;

  gl.useProgram(program);
  gl.uniform2f(viewportOffsetLocation, viewport.x, viewport.y);
  gl.uniform1f(zoomLocation, viewport.zoom);
  gl.uniform2f(resolutionLocation, canvasWidth, canvasHeight);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  const fillVertices = innerPoints
    ? outerPoints.flatMap((point, index) => [point.x, point.y, innerPoints[index].x, innerPoints[index].y])
    : [center, ...outerPoints].flatMap((point) => [point.x, point.y]);
  const fillMode = innerPoints ? gl.TRIANGLE_STRIP : gl.TRIANGLE_FAN;
  const fillVertexCount = innerPoints ? outerPoints.length * 2 : outerPoints.length + 1;
  const outlinePoints = innerPoints ? [...outerPoints, ...[...innerPoints].reverse()] : [center, ...outerPoints];

  if (ellipse.fill) {
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(fillVertices), gl.STATIC_DRAW);
    gl.uniform4fv(colorLocation, hexToRgbaFloat(ellipse.fill, ellipse.fillAlpha));
    gl.drawArrays(fillMode, 0, fillVertexCount);
  }

  if (ellipse.stroke) {
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(outlinePoints.flatMap((point) => [point.x, point.y])), gl.STATIC_DRAW);
    gl.uniform4fv(colorLocation, hexToRgbaFloat(ellipse.stroke));
    gl.drawArrays(gl.LINE_LOOP, 0, outlinePoints.length);
  }
};
