// utils
import { getOrLoadTexture } from '../getOrLoadTexture';
import { setActiveColorProfile } from '../activeColorProfile';

type TFakeImage = { naturalHeight: number; naturalWidth: number; onload: (() => void) | null; src: string };

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
    generateMipmap: vi.fn(),
    texImage2D: vi.fn(),
    texParameteri: vi.fn(),
  }) as unknown as WebGL2RenderingContext;

const stubImageConstructor = (): { getLastImage: () => TFakeImage } => {
  let lastImage: TFakeImage = { naturalHeight: 20, naturalWidth: 10, onload: null, src: '' };

  vi.stubGlobal(
    'Image',
    vi.fn(function FakeImage() {
      lastImage = { naturalHeight: 20, naturalWidth: 10, onload: null, src: '' };
      return lastImage;
    }),
  );

  return { getLastImage: () => lastImage };
};

describe('getOrLoadTexture', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    setActiveColorProfile('srgb');
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
    expect(gl.generateMipmap).toHaveBeenCalledWith(gl.TEXTURE_2D);
  });

  it('should record the loaded image natural size in the given size cache', () => {
    // mock
    const { getLastImage } = stubImageConstructor();
    const gl = createGlMock();
    const cache = new Map<string, WebGLTexture>();
    const sizeCache = new Map<string, { height: number; width: number }>();

    // before
    getOrLoadTexture(gl, cache, 'image.png', sizeCache);

    // action
    getLastImage().onload?.();

    // result
    expect(sizeCache.get('image.png')).toEqual({ height: 20, width: 10 });
  });

  it('should not touch a size cache that was not given', () => {
    // mock
    const { getLastImage } = stubImageConstructor();
    const gl = createGlMock();
    const cache = new Map<string, WebGLTexture>();

    // before / action / result
    expect(() => {
      getOrLoadTexture(gl, cache, 'image.png');
      getLastImage().onload?.();
    }).not.toThrow();
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

  it('should cache a Display P3 export render separately from the same src used with the sRGB (live canvas) profile', () => {
    // mock
    stubImageConstructor();

    const gl = createGlMock();
    const cache = new Map<string, WebGLTexture>();

    // before — first load at the default (srgb) profile
    const srgbTexture = getOrLoadTexture(gl, cache, 'image.png');

    setActiveColorProfile('displayP3');

    // action — same src, but now under the Display P3 profile
    const p3Texture = getOrLoadTexture(gl, cache, 'image.png');

    // result — two distinct cache entries/textures, so a live sRGB draw of the same image is never
    // silently corrupted by a Display P3 export (or vice versa)
    expect(p3Texture).not.toBe(srgbTexture);
    expect(cache.size).toBe(2);
  });

  it('should draw the image onto an intermediate Display P3 canvas and upload its gamut-mapped pixels when exporting with the Display P3 profile', () => {
    // mock
    const { getLastImage } = stubImageConstructor();
    const gl = createGlMock();
    const cache = new Map<string, WebGLTexture>();
    const drawImage = vi.fn();
    const p3ImageData = { data: new Uint8ClampedArray(4) };
    const getImageData = vi.fn().mockReturnValue(p3ImageData);
    const getContext = vi.fn().mockReturnValue({ drawImage, getImageData });

    vi.spyOn(document, 'createElement').mockReturnValue({ getContext, height: 0, width: 0 } as unknown as HTMLCanvasElement);

    setActiveColorProfile('displayP3');

    // before
    getOrLoadTexture(gl, cache, 'image.png');

    const image = getLastImage();

    // action
    image.onload?.();

    // result — decoded through a { colorSpace: 'display-p3' } canvas, not uploaded straight from the <img>
    expect(getContext).toHaveBeenCalledWith('2d', { colorSpace: 'display-p3' });
    expect(drawImage).toHaveBeenCalledWith(image, 0, 0);
    expect(getImageData).toHaveBeenCalledWith(0, 0, 10, 20, { colorSpace: 'display-p3' });
    expect(gl.texImage2D).toHaveBeenCalledWith(gl.TEXTURE_2D, 0, gl.RGBA, 10, 20, 0, gl.RGBA, gl.UNSIGNED_BYTE, p3ImageData.data);
  });

  it('should fall back to uploading the plain <img> element when a Display P3 canvas context is unavailable', () => {
    // mock — mirrors jsdom's own behavior (canvas 2D context stubbed to null without the optional `canvas` package)
    const { getLastImage } = stubImageConstructor();
    const gl = createGlMock();
    const cache = new Map<string, WebGLTexture>();

    vi.spyOn(document, 'createElement').mockReturnValue({
      getContext: vi.fn().mockReturnValue(null),
      height: 0,
      width: 0,
    } as unknown as HTMLCanvasElement);

    setActiveColorProfile('displayP3');

    // before
    getOrLoadTexture(gl, cache, 'image.png');

    const image = getLastImage();

    // action
    image.onload?.();

    // result
    expect(gl.texImage2D).toHaveBeenCalledWith(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  });
});
