// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { hexToRgbaFloat } from './hexToRgbaFloat';
import { rotatePoint } from 'utils/math/rotatePoint';

export const getQuadVertices = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
  x4: number,
  y4: number,
): number[] => [x1, y1, x2, y2, x3, y3, x1, y1, x3, y3, x4, y4];

const rotateFlatVertices = (flat: number[], center: TPoint, rotation: number): number[] =>
  Array.from({ length: flat.length / 2 }, (_, index) =>
    rotatePoint({ x: flat[index * 2], y: flat[index * 2 + 1] }, center, rotation),
  ).flatMap((point) => [point.x, point.y]);

export const drawThickOutline = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  rect: TDraftRect,
  color: string,
  strokeWidth: number,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
  rotation: number,
): void => {
  const positionLocation = gl.getAttribLocation(program, 'a_position');
  const colorLocation = gl.getUniformLocation(program, 'u_color');
  const viewportOffsetLocation = gl.getUniformLocation(program, 'u_viewportOffset');
  const zoomLocation = gl.getUniformLocation(program, 'u_zoom');
  const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
  const halfWidth = strokeWidth / viewport.zoom / 2;
  const outerX1 = rect.x - halfWidth;
  const outerY1 = rect.y - halfWidth;
  const outerX2 = rect.x + rect.width + halfWidth;
  const outerY2 = rect.y + rect.height + halfWidth;
  const innerX1 = rect.x + halfWidth;
  const innerY1 = rect.y + halfWidth;
  const innerX2 = rect.x + rect.width - halfWidth;
  const innerY2 = rect.y + rect.height - halfWidth;

  const rawVertices = [
    ...getQuadVertices(outerX1, outerY1, outerX2, outerY1, outerX2, innerY1, outerX1, innerY1), // top
    ...getQuadVertices(outerX1, innerY2, outerX2, innerY2, outerX2, outerY2, outerX1, outerY2), // bottom
    ...getQuadVertices(outerX1, innerY1, innerX1, innerY1, innerX1, innerY2, outerX1, innerY2), // left
    ...getQuadVertices(innerX2, innerY1, outerX2, innerY1, outerX2, innerY2, innerX2, innerY2), // right
  ];
  const center: TPoint = { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
  const vertices = rotateFlatVertices(rawVertices, center, rotation);

  gl.useProgram(program);
  gl.uniform2f(viewportOffsetLocation, viewport.x, viewport.y);
  gl.uniform1f(zoomLocation, viewport.zoom);
  gl.uniform2f(resolutionLocation, canvasWidth, canvasHeight);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  gl.uniform4fv(colorLocation, hexToRgbaFloat(color));
  gl.drawArrays(gl.TRIANGLES, 0, 24);
};
