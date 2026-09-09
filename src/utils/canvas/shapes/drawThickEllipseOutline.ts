// others
import { ELLIPSE_SEGMENTS } from 'constant/canvas';

// types
import { StrokeAlign } from 'types/design/enums';
import { TDraftRect, TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { getEllipsePoints } from './getEllipsePoints';
import { getRingVertices } from '../getRingVertices';
import { getStrokeAlignInset } from '../getStrokeAlignInset/getStrokeAlignInset';
import { hexToRgbaFloat } from '../hexToRgbaFloat';
import { rotatePoint } from 'utils/math/rotatePoint';

export const drawThickEllipseOutline = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  ellipse: TDraftRect,
  color: string,
  strokeWidth: number,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
  rotation: number,
  strokeAlign: StrokeAlign = StrokeAlign.center,
): void => {
  const positionLocation = gl.getAttribLocation(program, 'a_position');
  const colorLocation = gl.getUniformLocation(program, 'u_color');
  const viewportOffsetLocation = gl.getUniformLocation(program, 'u_viewportOffset');
  const zoomLocation = gl.getUniformLocation(program, 'u_zoom');
  const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
  const { inner, outer } = getStrokeAlignInset(strokeWidth / viewport.zoom, strokeAlign);
  const center: TPoint = { x: ellipse.x + ellipse.width / 2, y: ellipse.y + ellipse.height / 2 };

  const outerPoints = getEllipsePoints(
    { height: ellipse.height + outer * 2, width: ellipse.width + outer * 2, x: ellipse.x - outer, y: ellipse.y - outer },
    ELLIPSE_SEGMENTS,
  ).map((point) => rotatePoint(point, center, rotation));

  const innerPoints = getEllipsePoints(
    { height: ellipse.height - inner * 2, width: ellipse.width - inner * 2, x: ellipse.x + inner, y: ellipse.y + inner },
    ELLIPSE_SEGMENTS,
  ).map((point) => rotatePoint(point, center, rotation));

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
