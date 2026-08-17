// others
import { ROUNDED_POLYGON_CORNER_SEGMENTS } from 'constant/canvas';

// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { flipPoint } from 'utils/math/flipPoint';
import { getPolygonPoints } from './getPolygonPoints';
import { getRingVertices } from '../getRingVertices';
import { getRoundedPolygonPoints } from './getRoundedPolygonPoints';
import { hexToRgbaFloat } from '../hexToRgbaFloat';
import { rotatePoint } from 'utils/math/rotatePoint';

const getOutlinePoints = (bounds: TDraftRect, sides: number, cornerRadius: number): TPoint[] =>
  cornerRadius > 0
    ? getRoundedPolygonPoints({ ...bounds, cornerRadius, sides }, ROUNDED_POLYGON_CORNER_SEGMENTS)
    : getPolygonPoints(bounds, sides);

export const drawThickPolygonOutline = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  polygon: TDraftRect & { cornerRadius?: number; sides: number },
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
  const { sides } = polygon;
  const cornerRadius = polygon.cornerRadius ?? 0;
  const center: TPoint = { x: polygon.x + polygon.width / 2, y: polygon.y + polygon.height / 2 };

  const outerPoints = getOutlinePoints(
    { height: polygon.height + halfWidth * 2, width: polygon.width + halfWidth * 2, x: polygon.x - halfWidth, y: polygon.y - halfWidth },
    sides,
    cornerRadius,
  )
    .map((point) => flipPoint(point, center, flipX, flipY))
    .map((point) => rotatePoint(point, center, rotation));

  const innerPoints = getOutlinePoints(
    { height: polygon.height - halfWidth * 2, width: polygon.width - halfWidth * 2, x: polygon.x + halfWidth, y: polygon.y + halfWidth },
    sides,
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
