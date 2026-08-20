// types
import { TViewport } from 'types/design/types';

// utils
import { getThickPolylineVertices } from '../vectorNetwork/getThickPolylineVertices';
import { hexToRgbaFloat } from '../hexToRgbaFloat';
import { TFlattenedVectorSegment } from '../vectorNetwork/flattenVectorSegments';

export const drawVectorStroke = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  segments: TFlattenedVectorSegment[],
  color: string,
  strokeWidth: number,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
  alpha = 1,
): void => {
  const halfWidth = strokeWidth / 2;
  const vertices = segments.flatMap(({ points }) => getThickPolylineVertices(points, halfWidth));

  if (vertices.length === 0) {
    return;
  }

  const positionLocation = gl.getAttribLocation(program, 'a_position');
  const colorLocation = gl.getUniformLocation(program, 'u_color');
  const viewportOffsetLocation = gl.getUniformLocation(program, 'u_viewportOffset');
  const zoomLocation = gl.getUniformLocation(program, 'u_zoom');
  const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');

  gl.useProgram(program);
  gl.uniform2f(viewportOffsetLocation, viewport.x, viewport.y);
  gl.uniform1f(zoomLocation, viewport.zoom);
  gl.uniform2f(resolutionLocation, canvasWidth, canvasHeight);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  gl.uniform4fv(colorLocation, hexToRgbaFloat(color, alpha));
  gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 2);
};
