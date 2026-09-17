// utils
import { getOrCreateImagePlaceholderTexture } from '../getOrCreateImagePlaceholderTexture';

const createGlMock = (): WebGL2RenderingContext =>
  ({
    NEAREST: 9728,
    RGBA: 6408,
    TEXTURE_2D: 3553,
    TEXTURE_MAG_FILTER: 10240,
    TEXTURE_MIN_FILTER: 10241,
    UNSIGNED_BYTE: 5121,
    bindTexture: vi.fn(),
    createTexture: vi.fn((): WebGLTexture | null => ({})),
    texImage2D: vi.fn(),
    texParameteri: vi.fn(),
  }) as unknown as WebGL2RenderingContext;

describe('getOrCreateImagePlaceholderTexture', () => {
  it('should create and cache a checker placeholder texture on a cache miss', () => {
    // mock
    const gl = createGlMock();
    const cache = new Map<string, WebGLTexture>();

    // before
    const texture = getOrCreateImagePlaceholderTexture(gl, cache);

    // result
    expect(texture).not.toBeNull();
    expect(gl.texImage2D).toHaveBeenCalledWith(gl.TEXTURE_2D, 0, gl.RGBA, 256, 256, 0, gl.RGBA, gl.UNSIGNED_BYTE, expect.any(Uint8Array));
    expect(gl.texParameteri).toHaveBeenCalledWith(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    expect(gl.texParameteri).toHaveBeenCalledWith(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  });

  it('should return the cached texture on a second call without recreating it', () => {
    // mock
    const gl = createGlMock();
    const cache = new Map<string, WebGLTexture>();

    // before
    const first = getOrCreateImagePlaceholderTexture(gl, cache);

    (gl.createTexture as ReturnType<typeof vi.fn>).mockClear();
    (gl.texImage2D as ReturnType<typeof vi.fn>).mockClear();

    const second = getOrCreateImagePlaceholderTexture(gl, cache);

    // result
    expect(second).toBe(first);
    expect(gl.createTexture).not.toHaveBeenCalled();
    expect(gl.texImage2D).not.toHaveBeenCalled();
  });

  it('should return null when the context cannot create a texture', () => {
    // mock
    const gl = createGlMock();

    (gl.createTexture as ReturnType<typeof vi.fn>).mockReturnValue(null);

    const cache = new Map<string, WebGLTexture>();

    // result
    expect(getOrCreateImagePlaceholderTexture(gl, cache)).toBeNull();
    expect(gl.texImage2D).not.toHaveBeenCalled();
  });
});
