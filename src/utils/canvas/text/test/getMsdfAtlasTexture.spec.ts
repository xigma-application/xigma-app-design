// others
import { MSDF_ATLAS_PNG_URL } from 'constant/webgl/msdfAtlas';

// utils
import { getMsdfAtlasTexture } from '../getMsdfAtlasTexture';

type TFakeImage = { onload: (() => void) | null; src: string };

const createGlMock = (): WebGL2RenderingContext =>
  ({
    CLAMP_TO_EDGE: 33071,
    LINEAR: 9729,
    LINEAR_MIPMAP_LINEAR: 9987,
    RGBA: 6408,
    TEXTURE_2D: 3553,
    TEXTURE_MAG_FILTER: 10240,
    TEXTURE_MIN_FILTER: 10241,
    TEXTURE_WRAP_S: 10242,
    TEXTURE_WRAP_T: 10243,
    UNSIGNED_BYTE: 5121,
    bindTexture: vi.fn(),
    createTexture: vi.fn((): WebGLTexture | null => ({})),
    generateMipmap: vi.fn(),
    texImage2D: vi.fn(),
    texParameteri: vi.fn(),
  }) as unknown as WebGL2RenderingContext;

const stubImageConstructor = (): { getLastImage: () => TFakeImage } => {
  let lastImage: TFakeImage = { onload: null, src: '' };

  vi.stubGlobal(
    'Image',
    vi.fn(function FakeImage() {
      lastImage = { onload: null, src: '' };
      return lastImage;
    }),
  );

  return { getLastImage: () => lastImage };
};

describe('getMsdfAtlasTexture', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should load and cache the atlas texture keyed by the bundled atlas PNG URL', () => {
    // mock
    const { getLastImage } = stubImageConstructor();
    const gl = createGlMock();
    const cache = new Map<string, WebGLTexture>();

    // before
    const texture = getMsdfAtlasTexture(gl, cache);

    // result
    expect(texture).not.toBeNull();
    expect(cache.get(MSDF_ATLAS_PNG_URL)).toBe(texture);
    expect(getLastImage().src).toBe(MSDF_ATLAS_PNG_URL);
    expect(gl.texParameteri).toHaveBeenCalledWith(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  });

  it('should regenerate mipmaps once the real atlas image finishes loading', () => {
    // mock
    const { getLastImage } = stubImageConstructor();
    const gl = createGlMock();
    const cache = new Map<string, WebGLTexture>();

    // before
    getMsdfAtlasTexture(gl, cache);

    expect(gl.generateMipmap).not.toHaveBeenCalled();

    // action
    getLastImage().onload?.();

    // result — without this, minifying the distance field at zoom-out corrupts the median
    // threshold and the text visually fades instead of staying solid
    expect(gl.generateMipmap).toHaveBeenCalledWith(gl.TEXTURE_2D);
  });

  it('should return the cached texture on a second call, without creating a new one', () => {
    // mock
    stubImageConstructor();

    const gl = createGlMock();
    const cache = new Map<string, WebGLTexture>();

    // before
    const first = getMsdfAtlasTexture(gl, cache);

    (gl.createTexture as ReturnType<typeof vi.fn>).mockClear();

    const second = getMsdfAtlasTexture(gl, cache);

    // result
    expect(second).toBe(first);
    expect(gl.createTexture).not.toHaveBeenCalled();
  });

  it('should return null when the WebGL context fails to create a texture', () => {
    // mock
    const gl = createGlMock();

    (gl.createTexture as ReturnType<typeof vi.fn>).mockReturnValue(null);

    const cache = new Map<string, WebGLTexture>();

    // result
    expect(getMsdfAtlasTexture(gl, cache)).toBeNull();
  });
});
