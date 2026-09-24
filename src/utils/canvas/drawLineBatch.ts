// types
import { TLineSegment } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { hexToRgbaFloat } from './hexToRgbaFloat';

const FLOATS_PER_LINE = 12;

const writeLineQuad = (vertices: Float32Array, offset: number, line: TLineSegment, halfWidth: number): void => {
  const dx = line.x2 - line.x1;
  const dy = line.y2 - line.y1;
  const length = Math.hypot(dx, dy);
  const offsetX = (-dy / length) * halfWidth;
  const offsetY = (dx / length) * halfWidth;

  vertices.set(
    [
      line.x1 + offsetX,
      line.y1 + offsetY,
      line.x2 + offsetX,
      line.y2 + offsetY,
      line.x2 - offsetX,
      line.y2 - offsetY,
      line.x1 + offsetX,
      line.y1 + offsetY,
      line.x2 - offsetX,
      line.y2 - offsetY,
      line.x1 - offsetX,
      line.y1 - offsetY,
    ],
    offset,
  );
};

export const drawLineBatch = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  lines: TLineSegment[],
  color: string,
  strokeWidth: number,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
  alpha = 1,
): void => {
  const vertices = new Float32Array(lines.length * FLOATS_PER_LINE);
  let floatCount = 0;

  lines.forEach((line) => {
    if (line.x1 !== line.x2 || line.y1 !== line.y2) {
      writeLineQuad(vertices, floatCount, line, strokeWidth / 2);
      floatCount += FLOATS_PER_LINE;
    }
  });

  if (floatCount > 0) {
    const positionLocation = gl.getAttribLocation(program, 'a_position');

    gl.useProgram(program);
    gl.uniform2f(gl.getUniformLocation(program, 'u_viewportOffset'), viewport.x, viewport.y);
    gl.uniform1f(gl.getUniformLocation(program, 'u_zoom'), viewport.zoom);
    gl.uniform2f(gl.getUniformLocation(program, 'u_resolution'), canvasWidth, canvasHeight);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.bufferData(gl.ARRAY_BUFFER, vertices.subarray(0, floatCount), gl.STATIC_DRAW);
    gl.uniform4fv(gl.getUniformLocation(program, 'u_color'), hexToRgbaFloat(color, alpha));
    gl.drawArrays(gl.TRIANGLES, 0, floatCount / 2);
  }
};
