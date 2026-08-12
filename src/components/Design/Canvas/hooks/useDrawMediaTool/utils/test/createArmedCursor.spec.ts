// utils
import { createArmedCursor } from '../createArmedCursor';

type TFakeImage = { naturalHeight: number; naturalWidth: number; onload: (() => void) | null; src: string };

const stubImageConstructor = (): { getImages: () => TFakeImage[] } => {
  const images: TFakeImage[] = [];

  vi.stubGlobal(
    'Image',
    vi.fn(function FakeImage() {
      const image: TFakeImage = { naturalHeight: 0, naturalWidth: 0, onload: null, src: '' };

      images.push(image);

      return image;
    }),
  );

  return { getImages: () => images };
};

describe('createArmedCursor', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('should draw the crosshair and a scaled-down thumbnail, then report the composite as a cursor value', async () => {
    // mock
    const { getImages } = stubImageConstructor();
    const drawImage = vi.fn();
    const fillText = vi.fn();

    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ drawImage, fillText } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:image/png;base64,mock');

    const onReady = vi.fn();

    // before
    createArmedCursor('blob:mock-image', 1, onReady);

    const images = getImages();

    expect(images).toHaveLength(2);

    // action
    images[0].naturalWidth = 256;
    images[0].naturalHeight = 256;
    images[0].onload?.();

    images[1].naturalWidth = 400;
    images[1].naturalHeight = 200;
    images[1].onload?.();

    // result
    await vi.waitFor(() => expect(onReady).toHaveBeenCalled());

    expect(onReady).toHaveBeenCalledWith('-webkit-image-set(url(data:image/png;base64,mock) 8x) 16 16, auto');
    expect(drawImage).toHaveBeenCalledTimes(2);
    // wide thumbnail (400x200) scaled down so its width caps at THUMBNAIL_MAX_SIZE_PX (256), height halved
    expect(drawImage).toHaveBeenLastCalledWith(images[1], 192, 192, 256, 128);
    // a single queued file doesn't warrant a count badge
    expect(fillText).not.toHaveBeenCalled();
  });

  it('should draw a count badge when more than one file is queued', async () => {
    // mock
    const { getImages } = stubImageConstructor();
    const arc = vi.fn();
    const fill = vi.fn();
    const fillText = vi.fn();
    const drawImage = vi.fn();

    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      arc,
      beginPath: vi.fn(),
      drawImage,
      fill,
      fillText,
    } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:image/png;base64,mock');

    const onReady = vi.fn();

    // before
    createArmedCursor('blob:mock-image', 3, onReady);

    const images = getImages();

    images[0].onload?.();
    images[1].naturalWidth = 256;
    images[1].naturalHeight = 256;

    // action
    images[1].onload?.();

    // result
    await vi.waitFor(() => expect(onReady).toHaveBeenCalled());

    // the thumbnail (and the badge centered on its corner) is pushed further from the crosshair than
    // the no-badge case, clearing the circle from the crosshair's "+" glyph
    expect(drawImage).toHaveBeenLastCalledWith(images[1], 234, 234, 256, 256);
    expect(arc).toHaveBeenCalledWith(234, 234, 84, 0, Math.PI * 2);
    expect(fill).toHaveBeenCalled();
    expect(fillText).toHaveBeenCalledWith('3', 234, 234);
  });

  it('should do nothing when the canvas has no 2D context', async () => {
    // mock
    const { getImages } = stubImageConstructor();

    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);

    const onReady = vi.fn();

    // before
    createArmedCursor('blob:mock-image', 1, onReady);

    const images = getImages();

    // action
    images[0].onload?.();
    images[1].onload?.();
    await new Promise((resolve) => setTimeout(resolve, 0));

    // result
    expect(onReady).not.toHaveBeenCalled();
  });
});
