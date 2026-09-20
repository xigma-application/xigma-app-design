// utils
import { drawEffectBlurPass } from '../drawEffectBlurPass';

const createGlMock = (): WebGL2RenderingContext =>
  ({
    ARRAY_BUFFER: 34962,
    STATIC_DRAW: 35044,
    TEXTURE0: 33984,
    TEXTURE_2D: 3553,
    TRIANGLES: 4,
    activeTexture: vi.fn(),
    bindBuffer: vi.fn(),
    bindTexture: vi.fn(),
    bufferData: vi.fn(),
    disableVertexAttribArray: vi.fn(),
    drawArrays: vi.fn(),
    enableVertexAttribArray: vi.fn(),
    getAttribLocation: vi.fn(() => 0),
    getUniformLocation: vi.fn((_program: WebGLProgram, name: string) => ({ name })),
    uniform1f: vi.fn(),
    uniform1i: vi.fn(),
    uniform2f: vi.fn(),
    useProgram: vi.fn(),
    vertexAttribPointer: vi.fn(),
  }) as unknown as WebGL2RenderingContext;

describe('drawEffectBlurPass', () => {
  it('should sample the given texture along the direction with a texel size derived from the source dimensions', () => {
    // mock
    const gl = createGlMock();
    const texture = {} as WebGLTexture;

    // action
    drawEffectBlurPass(gl, {} as WebGLProgram, {} as WebGLBuffer, texture, [1, 0], 6, 50, 20);

    // result
    expect(gl.bindTexture).toHaveBeenCalledWith(gl.TEXTURE_2D, texture);
    expect(gl.uniform2f).toHaveBeenCalledWith({ name: 'u_direction' }, 1, 0);
    expect(gl.uniform1f).toHaveBeenCalledWith({ name: 'u_radius' }, 6);
    expect(gl.uniform2f).toHaveBeenCalledWith({ name: 'u_texelSize' }, 0.02, 0.05);
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, 6);
    expect(gl.bindTexture).toHaveBeenLastCalledWith(gl.TEXTURE_2D, null);
  });
});
