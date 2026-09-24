// utils
import { createShapeSdfTexture } from '../createShapeSdfTexture';

const createGlMock = (): WebGL2RenderingContext =>
  ({
    CLAMP_TO_EDGE: 33071,
    FLOAT: 5126,
    LINEAR: 9729,
    R16F: 33325,
    RED: 6403,
    TEXTURE_2D: 3553,
    TEXTURE_MAG_FILTER: 10240,
    TEXTURE_MIN_FILTER: 10241,
    TEXTURE_WRAP_S: 10242,
    TEXTURE_WRAP_T: 10243,
    UNPACK_ALIGNMENT: 3317,
    bindTexture: vi.fn(),
    createTexture: vi.fn(() => ({ tag: 'sdf' })),
    pixelStorei: vi.fn(),
    texImage2D: vi.fn(),
    texParameteri: vi.fn(),
  }) as unknown as WebGL2RenderingContext;

describe('createShapeSdfTexture', () => {
  it('should upload the distances as a filterable single-channel half-float texture', () => {
    // mock
    const gl = createGlMock();
    const values = new Float32Array([1, -1, 2, -2]);

    // action
    const texture = createShapeSdfTexture(gl, { cellSize: 1, height: 2, origin: { x: 0, y: 0 }, values, width: 2 });

    // result
    expect(texture).toEqual({ tag: 'sdf' });
    expect(gl.texImage2D).toHaveBeenCalledWith(gl.TEXTURE_2D, 0, gl.R16F, 2, 2, 0, gl.RED, gl.FLOAT, values);
    expect(gl.texParameteri).toHaveBeenCalledWith(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    expect(gl.bindTexture).toHaveBeenLastCalledWith(gl.TEXTURE_2D, null);
  });
});
