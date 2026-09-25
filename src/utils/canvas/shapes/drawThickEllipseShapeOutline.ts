// types
import { TEllipseShape } from './getEllipseFillPoints';
import { TViewport } from 'types/design/types';

// utils
import { getEllipseWorldPoints } from './getEllipseWorldPoints';
import { getRingVertices } from '../getRingVertices';
import { getStrokeOutlinePolygons } from '../vectorNetwork/getStrokeOutlinePolygons/getStrokeOutlinePolygons';
import { hexToRgbaFloat } from '../hexToRgbaFloat';

export const drawThickEllipseShapeOutline = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  ellipse: TEllipseShape,
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
  const { inner, outer } = getStrokeOutlinePolygons(
    getEllipseWorldPoints(ellipse, flipX, flipY, rotation),
    strokeWidth / viewport.zoom / 2,
    true,
  );
  const vertices = getRingVertices(outer, inner);

  gl.useProgram(program);
  gl.uniform2f(gl.getUniformLocation(program, 'u_viewportOffset'), viewport.x, viewport.y);
  gl.uniform1f(gl.getUniformLocation(program, 'u_zoom'), viewport.zoom);
  gl.uniform2f(gl.getUniformLocation(program, 'u_resolution'), canvasWidth, canvasHeight);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  gl.uniform4fv(gl.getUniformLocation(program, 'u_color'), hexToRgbaFloat(color));
  gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 2);
};
