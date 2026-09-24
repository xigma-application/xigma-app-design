// others
import { RECT_BATCH_BYTES_PER_FLOAT, RECT_BATCH_FLOATS_PER_VERTEX } from './constants';

const STRIDE = RECT_BATCH_FLOATS_PER_VERTEX * RECT_BATCH_BYTES_PER_FLOAT;
const COLOR_OFFSET = 2 * RECT_BATCH_BYTES_PER_FLOAT;
const POSITION_LOCATION = 0;
const COLOR_LOCATION = 1;

export const drawRectBuffer = (gl: WebGL2RenderingContext, buffer: WebGLBuffer, vertexCount: number): void => {
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.enableVertexAttribArray(POSITION_LOCATION);
  gl.enableVertexAttribArray(COLOR_LOCATION);
  gl.vertexAttribPointer(POSITION_LOCATION, 2, gl.FLOAT, false, STRIDE, 0);
  gl.vertexAttribPointer(COLOR_LOCATION, 4, gl.FLOAT, false, STRIDE, COLOR_OFFSET);
  gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
  gl.disableVertexAttribArray(COLOR_LOCATION);
};
