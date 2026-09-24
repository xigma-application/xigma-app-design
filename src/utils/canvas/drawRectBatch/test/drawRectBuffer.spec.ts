// utils
import { drawRectBuffer } from '../drawRectBuffer';

describe('drawRectBuffer', () => {
  it('should bind the buffer, wire both attributes, draw and release the color attribute', () => {
    // mock
    const buffer = {} as WebGLBuffer;
    const gl = {
      ARRAY_BUFFER: 1,
      FLOAT: 2,
      TRIANGLES: 3,
      bindBuffer: vi.fn(),
      disableVertexAttribArray: vi.fn(),
      drawArrays: vi.fn(),
      enableVertexAttribArray: vi.fn(),
      vertexAttribPointer: vi.fn(),
    } as unknown as WebGL2RenderingContext;

    // before
    drawRectBuffer(gl, buffer, 12);

    // result
    expect(gl.bindBuffer).toHaveBeenCalledWith(1, buffer);
    expect(gl.vertexAttribPointer).toHaveBeenCalledWith(0, 2, 2, false, 24, 0);
    expect(gl.vertexAttribPointer).toHaveBeenCalledWith(1, 4, 2, false, 24, 8);
    expect(gl.drawArrays).toHaveBeenCalledWith(3, 0, 12);
    expect(gl.disableVertexAttribArray).toHaveBeenCalledWith(1);
  });
});
