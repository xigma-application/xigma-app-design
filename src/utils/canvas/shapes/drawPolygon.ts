// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { getPolygonPoints } from './getPolygonPoints';
import { hexToRgbaFloat } from '../hexToRgbaFloat';

export type TDrawablePolygon = TDraftRect & {
  fill?: string;
  fillAlpha?: number;
  sides: number;
  stroke?: string;
};

const toFanVertices = (center: TPoint, points: TPoint[]): number[] => [center, ...points, points[0]].flatMap((point) => [point.x, point.y]);

export const drawPolygon = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  polygon: TDrawablePolygon,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const positionLocation = gl.getAttribLocation(program, 'a_position');
  const colorLocation = gl.getUniformLocation(program, 'u_color');
  const viewportOffsetLocation = gl.getUniformLocation(program, 'u_viewportOffset');
  const zoomLocation = gl.getUniformLocation(program, 'u_zoom');
  const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');

  const points = getPolygonPoints(polygon, polygon.sides);
  const center: TPoint = { x: polygon.x + polygon.width / 2, y: polygon.y + polygon.height / 2 };

  gl.useProgram(program);
  gl.uniform2f(viewportOffsetLocation, viewport.x, viewport.y);
  gl.uniform1f(zoomLocation, viewport.zoom);
  gl.uniform2f(resolutionLocation, canvasWidth, canvasHeight);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  if (polygon.fill) {
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(toFanVertices(center, points)), gl.STATIC_DRAW);
    gl.uniform4fv(colorLocation, hexToRgbaFloat(polygon.fill, polygon.fillAlpha));
    gl.drawArrays(gl.TRIANGLE_FAN, 0, points.length + 2);
  }

  if (polygon.stroke) {
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points.flatMap((point) => [point.x, point.y])), gl.STATIC_DRAW);
    gl.uniform4fv(colorLocation, hexToRgbaFloat(polygon.stroke));
    gl.drawArrays(gl.LINE_LOOP, 0, points.length);
  }
};
