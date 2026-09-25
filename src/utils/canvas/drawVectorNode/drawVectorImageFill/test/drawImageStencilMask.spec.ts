// utils
import { drawImageStencilMask } from '../drawImageStencilMask';

const getOrCreateFaceBufferMock = vi.fn();

vi.mock('../../getOrCreateFaceBuffer', () => ({
  getOrCreateFaceBuffer: (...args: unknown[]): unknown => getOrCreateFaceBufferMock(...args),
}));

describe('drawImageStencilMask', () => {
  it('should draw every face as a triangle fan from its own buffer', () => {
    // mock
    const gl = {
      FLOAT: 'FLOAT',
      TRIANGLE_FAN: 'FAN',
      drawArrays: vi.fn(),
      vertexAttribPointer: vi.fn(),
    } as unknown as WebGL2RenderingContext;
    const buffer = {} as WebGLBuffer;
    const faces = [
      [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
      ],
      [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 2, y: 2 },
        { x: 0, y: 2 },
      ],
    ];

    // before
    drawImageStencilMask(gl, 3, null, buffer, faces);

    // result
    expect(getOrCreateFaceBufferMock).toHaveBeenCalledWith(gl, null, buffer, faces[0]);
    expect(gl.vertexAttribPointer).toHaveBeenCalledWith(3, 2, 'FLOAT', false, 0, 0);
    expect(gl.drawArrays).toHaveBeenNthCalledWith(1, 'FAN', 0, 3);
    expect(gl.drawArrays).toHaveBeenNthCalledWith(2, 'FAN', 0, 4);
  });
});
