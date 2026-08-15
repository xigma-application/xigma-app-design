// others
import { FONT_SIZE_GUIDE_DASH_GAP_PX, FONT_SIZE_GUIDE_DASH_LENGTH_PX } from 'constant/canvas';

// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { getRectPerimeterPoint } from './getRectPerimeterPoint';
import { hexToRgbaFloat } from './hexToRgbaFloat';
import { rotatePoint } from 'utils/math/rotatePoint';

export const drawDashedRectOutline = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  rect: TDraftRect,
  color: string,
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

  const center: TPoint = { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
  const perimeter = 2 * (rect.width + rect.height);
  const patternLength = (FONT_SIZE_GUIDE_DASH_LENGTH_PX + FONT_SIZE_GUIDE_DASH_GAP_PX) / viewport.zoom;
  const dashCount = Math.max(1, Math.round(perimeter / patternLength));
  const segmentLength = perimeter / dashCount;
  const dashRatio = FONT_SIZE_GUIDE_DASH_LENGTH_PX / (FONT_SIZE_GUIDE_DASH_LENGTH_PX + FONT_SIZE_GUIDE_DASH_GAP_PX);

  const dashVertices = Array.from({ length: dashCount }, (_, index) => {
    const start = index * segmentLength;
    const end = start + segmentLength * dashRatio;
    const startPoint = rotatePoint(getRectPerimeterPoint(rect, start), center, rotation);
    const endPoint = rotatePoint(getRectPerimeterPoint(rect, end), center, rotation);

    return [startPoint.x, startPoint.y, endPoint.x, endPoint.y];
  }).flat();

  gl.useProgram(program);
  gl.uniform2f(viewportOffsetLocation, viewport.x, viewport.y);
  gl.uniform1f(zoomLocation, viewport.zoom);
  gl.uniform2f(resolutionLocation, canvasWidth, canvasHeight);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(dashVertices), gl.STATIC_DRAW);
  gl.uniform4fv(colorLocation, hexToRgbaFloat(color));
  gl.drawArrays(gl.LINES, 0, dashVertices.length / 2);
};
