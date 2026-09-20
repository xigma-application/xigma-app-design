// utils
import { drawEffectShapeFan } from '../drawEffectShapeFan';

const createGlMock = (): WebGL2RenderingContext =>
  ({
    ARRAY_BUFFER: 34962,
    FLOAT: 5126,
    STATIC_DRAW: 35044,
    TRIANGLE_FAN: 6,
    bindBuffer: vi.fn(),
    bufferData: vi.fn(),
    disableVertexAttribArray: vi.fn(),
    drawArrays: vi.fn(),
    enableVertexAttribArray: vi.fn(),
    getAttribLocation: vi.fn(() => 0),
    getUniformLocation: vi.fn((_program: WebGLProgram, name: string) => ({ name })),
    uniform1f: vi.fn(),
    uniform2f: vi.fn(),
    uniform4f: vi.fn(),
    useProgram: vi.fn(),
    vertexAttribPointer: vi.fn(),
  }) as unknown as WebGL2RenderingContext;

describe('drawEffectShapeFan', () => {
  it('should draw the rounded rect as a fan sized to the target and colored with the given color', () => {
    // mock
    const gl = createGlMock();
    const rect = { cornerRadius: 0, height: 20, width: 40, x: 4, y: 4 };

    // action
    drawEffectShapeFan(gl, {} as WebGLProgram, {} as WebGLBuffer, rect, 48, 28, [1, 0, 0, 1]);

    // result
    expect(gl.uniform2f).toHaveBeenCalledWith({ name: 'u_viewportOffset' }, 0, 0);
    expect(gl.uniform1f).toHaveBeenCalledWith({ name: 'u_zoom' }, 1);
    expect(gl.uniform2f).toHaveBeenCalledWith({ name: 'u_resolution' }, 48, 28);
    expect(gl.uniform4f).toHaveBeenCalledWith({ name: 'u_color' }, 1, 0, 0, 1);
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLE_FAN, 0, expect.any(Number));
  });
});
