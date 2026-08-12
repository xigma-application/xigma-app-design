// utils
import { getOrLoadTexture } from '../getOrLoadTexture';

type TFakeImage = { onload: (() => void) | null; src: string };

const createGlMock = (): WebGL2RenderingContext =>
  ({
    CLAMP_TO_EDGE: 33071,
    LINEAR: 9729,
    RGBA: 6408,
    TEXTURE_2D: 3553,
    TEXTURE_MAG_FILTER: 10240,
    TEXTURE_MIN_FILTER: 10241,
    TEXTURE_WRAP_S: 10242,
    TEXTURE_WRAP_T: 10243,
    UNSIGNED_BYTE: 5121,
    bindTexture: vi.fn(),
    createTexture: vi.fn((): WebGLTexture | null => ({})),
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

describe('getOrLoadTexture', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should return the cached texture without creating a new one', () => {
    // mock
    const gl = createGlMock();
    const cachedTexture = {} as WebGLTexture;
    const cache = new Map<string, WebGLTexture>([['image.png', cachedTexture]]);

    // result
    expect(getOrLoadTexture(gl, cache, 'image.png')).toBe(cachedTexture);
    expect(gl.createTexture).not.toHaveBeenCalled();
  });

  it('should create and cache a placeholder texture on a cache miss', () => {
    // mock
    stubImageConstructor();

    const gl = createGlMock();
    const cache = new Map<string, WebGLTexture>();

    // before
    const texture = getOrLoadTexture(gl, cache, 'image.png');

    // result
    expect(texture).not.toBeNull();
    expect(cache.get('image.png')).toBe(texture);
    expect(gl.texImage2D).toHaveBeenCalledWith(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, expect.any(Uint8Array));
  });

  it('should upload the loaded image into the texture once it loads', () => {
    // mock
    const { getLastImage } = stubImageConstructor();
    const gl = createGlMock();
    const cache = new Map<string, WebGLTexture>();

    // before
    const texture = getOrLoadTexture(gl, cache, 'image.png');
    const image = getLastImage();

    // result
    expect(image.src).toBe('image.png');

    // action
    image.onload?.();

    // result
    expect(gl.texImage2D).toHaveBeenCalledWith(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    expect(gl.bindTexture).toHaveBeenCalledWith(gl.TEXTURE_2D, texture);
  });

  it('should return null when the context cannot create a texture', () => {
    // mock
    const gl = createGlMock();

    (gl.createTexture as ReturnType<typeof vi.fn>).mockReturnValue(null);

    const cache = new Map<string, WebGLTexture>();

    // result
    expect(getOrLoadTexture(gl, cache, 'image.png')).toBeNull();
    expect(gl.texImage2D).not.toHaveBeenCalled();
  });
});
