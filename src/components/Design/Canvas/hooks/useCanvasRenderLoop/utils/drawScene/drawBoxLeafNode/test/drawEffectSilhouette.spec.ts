// utils
import { drawEffectSilhouette } from '../drawEffectSilhouette';

const createGlMock = (): WebGL2RenderingContext =>
  ({
    ARRAY_BUFFER: 34962,
    COLOR_BUFFER_BIT: 16384,
    ONE: 1,
    STATIC_DRAW: 35044,
    TRIANGLE_FAN: 6,
    ZERO: 0,
    bindBuffer: vi.fn(),
    blendFuncSeparate: vi.fn(),
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

describe('drawEffectSilhouette', () => {
  it('should clear the target to the shadow color and punch a hole that keeps the color but zeroes the alpha', () => {
    // mock
    const gl = createGlMock();
    const holeRect = { cornerRadius: 0, height: 10, width: 20, x: 5, y: 5 };

    // action
    drawEffectSilhouette(gl, {} as WebGLProgram, {} as WebGLBuffer, holeRect, 30, 20, [0.2, 0.4, 0.6]);

    // result
    expect(gl.clearColor).toHaveBeenCalledWith(0.2, 0.4, 0.6, 1);
    expect(gl.clear).toHaveBeenCalledWith(gl.COLOR_BUFFER_BIT);
    expect(gl.blendFuncSeparate).toHaveBeenCalledWith(gl.ZERO, gl.ONE, gl.ZERO, gl.ZERO);
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLE_FAN, 0, expect.any(Number));
  });

  it('should skip the hole draw when the hole has collapsed to zero size', () => {
    // mock
    const gl = createGlMock();
    const holeRect = { cornerRadius: 0, height: 0, width: 0, x: 15, y: 15 };

    // action
    drawEffectSilhouette(gl, {} as WebGLProgram, {} as WebGLBuffer, holeRect, 30, 30, [0, 0, 0]);

    // result
    expect(gl.blendFuncSeparate).not.toHaveBeenCalled();
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });
});
