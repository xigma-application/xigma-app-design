// others
import { DASH_GAP_PX, DASH_LENGTH_PX } from 'constant/canvas';

// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { buildEllipseArcLengthTable } from './buildEllipseArcLengthTable';
import { getEllipseCircumference } from './getEllipseCircumference';
import { getEllipsePathSample } from './getEllipsePathSample';
import { hexToRgbaFloat } from '../hexToRgbaFloat';
import { rotatePoint } from 'utils/math/rotatePoint';

export const drawDashedEllipseOutline = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  ellipse: TDraftRect,
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

  const center: TPoint = { x: ellipse.x + ellipse.width / 2, y: ellipse.y + ellipse.height / 2 };
  const table = buildEllipseArcLengthTable(ellipse.width, ellipse.height);
  const circumference = getEllipseCircumference(table);
  const patternLength = (DASH_LENGTH_PX + DASH_GAP_PX) / viewport.zoom;
  const dashCount = Math.max(1, Math.round(circumference / patternLength));
  const segmentLength = circumference / dashCount;
  const dashRatio = DASH_LENGTH_PX / (DASH_LENGTH_PX + DASH_GAP_PX);

  const dashVertices = Array.from({ length: dashCount }, (_, index) => {
    const start = index * segmentLength;
    const end = start + segmentLength * dashRatio;
    const startSample = getEllipsePathSample(ellipse.width, ellipse.height, table, start);
    const endSample = getEllipsePathSample(ellipse.width, ellipse.height, table, end);
    const startPoint = rotatePoint({ x: center.x + startSample.x, y: center.y + startSample.y }, center, rotation);
    const endPoint = rotatePoint({ x: center.x + endSample.x, y: center.y + endSample.y }, center, rotation);

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
