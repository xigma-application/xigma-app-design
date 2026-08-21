// types
import { TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { getDashVertices } from './getDashVertices';
import { hexToRgbaFloat } from '../hexToRgbaFloat';
import { TPolylineSegment } from './getPointAtDistance';

export const drawDashedPolylineOutline = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  points: TPoint[],
  color: string,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
  dashLength: number,
  dashGap: number,
): void => {
  if (points.length >= 2) {
    const segments: TPolylineSegment[] = points.map((point, index) => [point, points[(index + 1) % points.length]]);
    const perimeter = segments.reduce((sum, [start, end]) => sum + Math.hypot(end.x - start.x, end.y - start.y), 0);

    if (perimeter !== 0) {
      const dashVertices = getDashVertices(segments, perimeter, viewport.zoom, dashLength, dashGap);
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

      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(dashVertices), gl.STATIC_DRAW);
      gl.uniform4fv(colorLocation, hexToRgbaFloat(color));
      gl.drawArrays(gl.LINES, 0, dashVertices.length / 2);
    }
  }
};
