type TFakeImage = { complete: boolean; onload: (() => void) | null; src: string };

const stubImageConstructor = (): { getImage: () => TFakeImage } => {
  let image: TFakeImage;

  vi.stubGlobal(
    'Image',
    vi.fn(function FakeImage() {
      image = { complete: false, onload: null, src: '' };

      return image;
    }),
  );

  return { getImage: () => image };
};

describe('getRotatedScaleCursorUrl', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it('should return null before the base cursor image has finished loading', async () => {
    // mock
    stubImageConstructor();

    const { getRotatedScaleCursorUrl } = await import('../getRotatedScaleCursorUrl');

    // result
    expect(getRotatedScaleCursorUrl(0)).toBeNull();
  });

  it('should return null when the canvas has no 2D context', async () => {
    // mock
    const { getImage } = stubImageConstructor();

    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);

    const { getRotatedScaleCursorUrl } = await import('../getRotatedScaleCursorUrl');

    // before — first call lazily constructs the singleton image so it can be marked loaded
    getRotatedScaleCursorUrl(0);
    getImage().complete = true;

    // result
    expect(getRotatedScaleCursorUrl(0)).toBeNull();
  });

  it('should draw the rotated cursor and return it as a data URL once the image has loaded', async () => {
    // mock
    const { getImage } = stubImageConstructor();
    const translate = vi.fn();
    const rotate = vi.fn();
    const drawImage = vi.fn();

    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      drawImage,
      rotate,
      translate,
    } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:image/png;base64,mock');

    const { getRotatedScaleCursorUrl } = await import('../getRotatedScaleCursorUrl');

    // before
    getRotatedScaleCursorUrl(45);
    getImage().complete = true;

    // action
    const url = getRotatedScaleCursorUrl(45);

    // result
    expect(translate).toHaveBeenCalledWith(16, 16);
    expect(rotate).toHaveBeenCalledWith((45 * Math.PI) / 180);
    expect(drawImage).toHaveBeenCalledWith(getImage(), -16, -16, 32, 32);
    expect(url).toBe('url(data:image/png;base64,mock) 16 16, auto');
  });

  it('should reuse the cached data URL for a repeated angle instead of redrawing', async () => {
    // mock
    const { getImage } = stubImageConstructor();
    const toDataURL = vi.fn().mockReturnValue('data:image/png;base64,mock');

    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      drawImage: vi.fn(),
      rotate: vi.fn(),
      translate: vi.fn(),
    } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockImplementation(toDataURL);

    const { getRotatedScaleCursorUrl } = await import('../getRotatedScaleCursorUrl');

    // before
    getRotatedScaleCursorUrl(90);
    getImage().complete = true;

    // action
    getRotatedScaleCursorUrl(90);
    getRotatedScaleCursorUrl(90);

    // result
    expect(toDataURL).toHaveBeenCalledTimes(1);
  });
});
