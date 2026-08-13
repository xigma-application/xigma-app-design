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

describe('getRotatedRotateCursorUrl', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it('should return null before the base cursor image has finished loading', async () => {
    // mock
    stubImageConstructor();

    const { getRotatedRotateCursorUrl } = await import('../getRotatedRotateCursorUrl');

    // result
    expect(getRotatedRotateCursorUrl(0)).toBeNull();
  });

  it('should draw the rotated cursor and return it as a data URL once the image has loaded', async () => {
    // mock
    const { getImage } = stubImageConstructor();

    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      drawImage: vi.fn(),
      rotate: vi.fn(),
      translate: vi.fn(),
    } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:image/png;base64,mock');

    const { getRotatedRotateCursorUrl } = await import('../getRotatedRotateCursorUrl');

    // before
    getRotatedRotateCursorUrl(45);
    getImage().complete = true;

    // action
    const url = getRotatedRotateCursorUrl(45);

    // result
    expect(url).toBe('url(data:image/png;base64,mock) 16 16, auto');
  });
});
