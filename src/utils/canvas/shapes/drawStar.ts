// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { flipPoint } from 'utils/math/flipPoint';
import { getStarPoints } from './getStarPoints';
import { hexToRgbaFloat } from '../hexToRgbaFloat';
import { rotatePoint } from 'utils/math/rotatePoint';

export type TDrawableStar = TDraftRect & {
  fill?: string;
  fillAlpha?: number;
  points: number;
  ratio: number;
  stroke?: string;
};

const toFanVertices = (center: TPoint, points: TPoint[]): number[] => [center, ...points, points[0]].flatMap((point) => [point.x, point.y]);

export const drawStar = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  star: TDrawableStar,
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

  const center: TPoint = { x: star.x + star.width / 2, y: star.y + star.height / 2 };
  const points = getStarPoints(star, star.points, star.ratio)
    .map((point) => flipPoint(point, center, flipX, flipY))
    .map((point) => rotatePoint(point, center, rotation));

  gl.useProgram(program);
  gl.uniform2f(viewportOffsetLocation, viewport.x, viewport.y);
  gl.uniform1f(zoomLocation, viewport.zoom);
  gl.uniform2f(resolutionLocation, canvasWidth, canvasHeight);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  if (star.fill) {
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(toFanVertices(center, points)), gl.STATIC_DRAW);
    gl.uniform4fv(colorLocation, hexToRgbaFloat(star.fill, star.fillAlpha));
    gl.drawArrays(gl.TRIANGLE_FAN, 0, points.length + 2);
  }

  if (star.stroke) {
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points.flatMap((point) => [point.x, point.y])), gl.STATIC_DRAW);
    gl.uniform4fv(colorLocation, hexToRgbaFloat(star.stroke));
    gl.drawArrays(gl.LINE_LOOP, 0, points.length);
  }
};
