// utils
import { drawEffectShapeMask } from '../drawEffectShapeMask';

const createGlMock = (): WebGL2RenderingContext =>
  ({
    ARRAY_BUFFER: 34962,
    COLOR_BUFFER_BIT: 16384,
    STATIC_DRAW: 35044,
    TRIANGLE_FAN: 6,
    bindBuffer: vi.fn(),
    bufferData: vi.fn(),
    clear: vi.fn(),
    clearColor: vi.fn(),
    disableVertexAttribArray: vi.fn(),
    drawArrays: vi.fn(),
    enableVertexAttribArray: vi.fn(),
    getAttribLocation: vi.fn(() => 0),
    getUniformLocation: vi.fn(() => ({})),
    uniform1f: vi.fn(),
    uniform2f: vi.fn(),
    uniform4f: vi.fn(),
    useProgram: vi.fn(),
    vertexAttribPointer: vi.fn(),
  }) as unknown as WebGL2RenderingContext;

describe('drawEffectShapeMask', () => {
  it('should clear the target to transparent then fill the shape opaque white', () => {
    // mock
    const gl = createGlMock();
    const shapeRect = { cornerRadius: 0, height: 20, width: 40, x: 8, y: 8 };

    // action
    drawEffectShapeMask(gl, {} as WebGLProgram, {} as WebGLBuffer, shapeRect, 56, 36);

    // result
    expect(gl.clearColor).toHaveBeenNthCalledWith(1, 0, 0, 0, 0);
    expect(gl.clear).toHaveBeenCalledWith(gl.COLOR_BUFFER_BIT);
    expect(gl.uniform4f).toHaveBeenCalledWith({}, 1, 1, 1, 1);
  });
});
