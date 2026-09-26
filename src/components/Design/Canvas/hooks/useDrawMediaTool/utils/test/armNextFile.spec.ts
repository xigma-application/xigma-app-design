// others
import { OBJECT_URLS_BY_FILE_HASH } from 'utils/media/constants';

// store
import { setMediaToolArmed } from 'store/design/slice';

// types
import { TArmedMedia } from '../loadArmedMedia';

// utils
import { armNextFile } from '../armNextFile';

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

describe('armNextFile', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('should clear the armed ref and reset the cursor when the queue is empty', () => {
    // mock
    const canvas = document.createElement('canvas');
    const canvasRef = { current: canvas };
    const armedRef: { current: TArmedMedia | null } = { current: { kind: 'image', naturalHeight: 10, naturalWidth: 10, src: 'blob:old' } };
    const queueRef = { current: [] as File[] };

    canvas.style.cursor = 'previous-cursor';

    const dispatch = vi.fn();

    // before
    armNextFile(canvasRef, armedRef, queueRef, dispatch);

    // result
    expect(armedRef.current).toBeNull();
    expect(canvas.style.cursor).toBe('');
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('should not crash resetting the cursor when the canvas ref is unavailable', () => {
    // mock
    const canvasRef = { current: null };
    const armedRef: { current: TArmedMedia | null } = { current: null };
    const queueRef = { current: [] as File[] };

    // action / result
    expect(() => armNextFile(canvasRef, armedRef, queueRef, vi.fn())).not.toThrow();
  });

  it('should arm the next file from the queue and set a composite cursor once it loads', async () => {
    // mock
    OBJECT_URLS_BY_FILE_HASH.clear();
    URL.createObjectURL = vi.fn(() => 'blob:mock-url');

    const canvas = document.createElement('canvas');
    const canvasRef = { current: canvas };
    const armedRef: { current: TArmedMedia | null } = { current: null };
    const nextFile = new File(['x'], 'photo.png', { type: 'image/png' });
    const queueRef = { current: [nextFile] };
    const { getImages } = stubImageConstructor();
    const drawImage = vi.fn();

    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ drawImage } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:image/png;base64,mock');
    // jsdom's CSS parser rejects the `-webkit-image-set(...)` cursor syntax as invalid and
    // silently no-ops the assignment, so swap in a plain mutable object to observe it directly
    Object.defineProperty(canvas, 'style', { configurable: true, value: { cursor: '' }, writable: true });

    const dispatch = vi.fn();

    // before
    armNextFile(canvasRef, armedRef, queueRef, dispatch);

    // result — the single queued file is shifted off, leaving the queue empty
    expect(queueRef.current).toEqual([]);

    // action — resolve the source image first (loadArmedMedia), which is what triggers
    // createArmedCursor to construct the crosshair+thumbnail images in turn
    await vi.waitFor(() => expect(getImages()).toHaveLength(1));

    const [sourceImage] = getImages();

    sourceImage.naturalWidth = 200;
    sourceImage.naturalHeight = 100;
    sourceImage.onload?.();

    // result
    expect(armedRef.current).toEqual({ kind: 'image', naturalHeight: 100, naturalWidth: 200, src: 'blob:mock-url' });
    expect(dispatch).toHaveBeenCalledWith(setMediaToolArmed(true));

    const [, crosshairImage, thumbnailImage] = getImages();

    crosshairImage.onload?.();
    thumbnailImage.onload?.();

    // result — a single-file queue means no count badge (badgeCount === 1), only the plain crosshair
    await vi.waitFor(() => expect(canvas.style.cursor).not.toBe(''));
    expect(canvas.style.cursor).toBe('-webkit-image-set(url(data:image/png;base64,mock) 8x) 16 16, auto');
    expect(drawImage).toHaveBeenCalledTimes(2);
  });
});
