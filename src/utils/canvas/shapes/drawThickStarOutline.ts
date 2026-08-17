// others
import { ROUNDED_STAR_CORNER_SEGMENTS } from 'constant/canvas';

// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { flipPoint } from 'utils/math/flipPoint';
import { getRingVertices } from '../getRingVertices';
import { getRoundedStarPoints } from './getRoundedStarPoints';
import { getStarPoints } from './getStarPoints';
import { hexToRgbaFloat } from '../hexToRgbaFloat';
import { rotatePoint } from 'utils/math/rotatePoint';

const getOutlinePoints = (bounds: TDraftRect, points: number, ratio: number, cornerRadius: number): TPoint[] =>
  cornerRadius > 0
    ? getRoundedStarPoints({ ...bounds, cornerRadius, points, ratio }, ROUNDED_STAR_CORNER_SEGMENTS)
    : getStarPoints(bounds, points, ratio);

export const drawThickStarOutline = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  star: TDraftRect & { cornerRadius?: number; points: number; ratio: number },
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
  const { points, ratio } = star;
  const cornerRadius = star.cornerRadius ?? 0;
  const center: TPoint = { x: star.x + star.width / 2, y: star.y + star.height / 2 };

  const outerPoints = getOutlinePoints(
    { height: star.height + halfWidth * 2, width: star.width + halfWidth * 2, x: star.x - halfWidth, y: star.y - halfWidth },
    points,
    ratio,
    cornerRadius,
  )
    .map((point) => flipPoint(point, center, flipX, flipY))
    .map((point) => rotatePoint(point, center, rotation));

  const innerPoints = getOutlinePoints(
    { height: star.height - halfWidth * 2, width: star.width - halfWidth * 2, x: star.x + halfWidth, y: star.y + halfWidth },
    points,
    ratio,
    cornerRadius,
  )
    .map((point) => flipPoint(point, center, flipX, flipY))
    .map((point) => rotatePoint(point, center, rotation));

  const vertices = getRingVertices(outerPoints, innerPoints);

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
};
