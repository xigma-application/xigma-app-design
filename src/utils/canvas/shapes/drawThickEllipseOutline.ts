// others
import { ELLIPSE_SEGMENTS } from 'constant/canvas';

// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { getEllipsePoints } from './getEllipsePoints';
import { getQuadVertices } from '../drawThickOutline';
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
): void => {
  const positionLocation = gl.getAttribLocation(program, 'a_position');
  const colorLocation = gl.getUniformLocation(program, 'u_color');
  const viewportOffsetLocation = gl.getUniformLocation(program, 'u_viewportOffset');
  const zoomLocation = gl.getUniformLocation(program, 'u_zoom');
  const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
  const halfWidth = strokeWidth / viewport.zoom / 2;
  const center: TPoint = { x: ellipse.x + ellipse.width / 2, y: ellipse.y + ellipse.height / 2 };

  const outerPoints = getEllipsePoints(
    { height: ellipse.height + halfWidth * 2, width: ellipse.width + halfWidth * 2, x: ellipse.x - halfWidth, y: ellipse.y - halfWidth },
    ELLIPSE_SEGMENTS,
  ).map((point) => rotatePoint(point, center, rotation));
  const innerPoints = getEllipsePoints(
    { height: ellipse.height - halfWidth * 2, width: ellipse.width - halfWidth * 2, x: ellipse.x + halfWidth, y: ellipse.y + halfWidth },
    ELLIPSE_SEGMENTS,
  ).map((point) => rotatePoint(point, center, rotation));

  const vertices = outerPoints.flatMap((outerPoint, index) => {
    const nextIndex = (index + 1) % ELLIPSE_SEGMENTS;

    return getQuadVertices(
      outerPoint.x,
      outerPoint.y,
      outerPoints[nextIndex].x,
      outerPoints[nextIndex].y,
      innerPoints[nextIndex].x,
      innerPoints[nextIndex].y,
      innerPoints[index].x,
      innerPoints[index].y,
    );
  });

  gl.useProgram(program);
  gl.uniform2f(viewportOffsetLocation, viewport.x, viewport.y);
  gl.uniform1f(zoomLocation, viewport.zoom);
  gl.uniform2f(resolutionLocation, canvasWidth, canvasHeight);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  gl.uniform4fv(colorLocation, hexToRgbaFloat(color));
  gl.drawArrays(gl.TRIANGLES, 0, ELLIPSE_SEGMENTS * 6);
};
