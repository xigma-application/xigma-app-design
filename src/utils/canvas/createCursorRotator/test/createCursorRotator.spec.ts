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

describe('createCursorRotator', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it('should return null before the base cursor image has finished loading', async () => {
    // mock
    stubImageConstructor();

    const { createCursorRotator } = await import('../createCursorRotator');
    const rotate = createCursorRotator('my-cursor.png');

    // result
    expect(rotate(0)).toBeNull();
  });

  it('should return null when the canvas has no 2D context', async () => {
    // mock
    const { getImage } = stubImageConstructor();

    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);

    const { createCursorRotator } = await import('../createCursorRotator');
    const rotate = createCursorRotator('my-cursor.png');

    // before — first call lazily constructs the singleton image so it can be marked loaded
    rotate(0);
    getImage().complete = true;

    // result
    expect(rotate(0)).toBeNull();
  });

  it('should draw the rotated cursor and return it as a data URL once the image has loaded', async () => {
    // mock
    const { getImage } = stubImageConstructor();
    const translate = vi.fn();
    const rotateContext = vi.fn();
    const drawImage = vi.fn();

    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      drawImage,
      rotate: rotateContext,
      translate,
    } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:image/png;base64,mock');

    const { createCursorRotator } = await import('../createCursorRotator');
    const rotate = createCursorRotator('my-cursor.png');

    // before
    rotate(45);
    getImage().complete = true;

    // action
    const url = rotate(45);

    // result
    expect(translate).toHaveBeenCalledWith(16, 16);
    expect(rotateContext).toHaveBeenCalledWith((45 * Math.PI) / 180);
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

    const { createCursorRotator } = await import('../createCursorRotator');
    const rotate = createCursorRotator('my-cursor.png');

    // before
    rotate(90);
    getImage().complete = true;

    // action
    rotate(90);
    rotate(90);

    // result
    expect(toDataURL).toHaveBeenCalledTimes(1);
  });

  it('should keep separate image/cache state for two independent rotator instances', async () => {
    // mock
    let imageCount = 0;
    const images: TFakeImage[] = [];

    vi.stubGlobal(
      'Image',
      vi.fn(function FakeImage() {
        const image: TFakeImage = { complete: false, onload: null, src: '' };

        images[imageCount] = image;
        imageCount += 1;

        return image;
      }),
    );
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      drawImage: vi.fn(),
      rotate: vi.fn(),
      translate: vi.fn(),
    } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:image/png;base64,mock');

    const { createCursorRotator } = await import('../createCursorRotator');
    const rotateA = createCursorRotator('cursor-a.png');
    const rotateB = createCursorRotator('cursor-b.png');

    // before — construct both singleton images, then mark only the first as loaded
    rotateA(0);
    rotateB(0);
    images[0].complete = true;

    // result — the second rotator's image is still loading, so it stays null
    expect(rotateA(0)).not.toBeNull();
    expect(rotateB(0)).toBeNull();
    expect(images[0].src).toBe('cursor-a.png');
    expect(images[1].src).toBe('cursor-b.png');
  });
});
