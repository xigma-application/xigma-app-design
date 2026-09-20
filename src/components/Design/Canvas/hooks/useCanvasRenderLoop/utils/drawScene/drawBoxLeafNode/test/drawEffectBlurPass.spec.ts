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
    uniform4f: vi.fn(),
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
    expect(gl.uniform1i).toHaveBeenCalledWith({ name: 'u_progressive' }, 0);
    expect(gl.uniform2f).toHaveBeenCalledWith({ name: 'u_size' }, 50, 20);
    expect(gl.uniform1i).toHaveBeenCalledWith({ name: 'u_unpremultiply' }, 0);
  });

  it('should upload the progressive line and radii when given', () => {
    // mock
    const gl = createGlMock();

    // action
    drawEffectBlurPass(gl, {} as WebGLProgram, {} as WebGLBuffer, {} as WebGLTexture, [0, 1], 6, 50, 20, {
      line: [1, 2, 3, 4],
      radii: [0, 6],
    });

    // result
    expect(gl.uniform1i).toHaveBeenCalledWith({ name: 'u_progressive' }, 1);
    expect(gl.uniform4f).toHaveBeenCalledWith({ name: 'u_line' }, 1, 2, 3, 4);
    expect(gl.uniform2f).toHaveBeenCalledWith({ name: 'u_radii' }, 0, 6);
  });
});
