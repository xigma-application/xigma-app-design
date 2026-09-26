// others
import { OBJECT_URLS_BY_FILE_HASH, VIDEO_FRAMES_BY_FILE_HASH } from 'utils/media/constants';

// utils
import { loadArmedMedia } from '../loadArmedMedia';
import { videoSrcUrlCache } from 'shared/UITools/ColorPicker/Body/VideoPanel/utils/videoSrcUrlCache';

type TFakeImage = { naturalHeight: number; naturalWidth: number; onload: (() => void) | null; src: string };

const stubImageConstructor = (): { getLastImage: () => TFakeImage } => {
  let lastImage: TFakeImage = { naturalHeight: 0, naturalWidth: 0, onload: null, src: '' };

  vi.stubGlobal(
    'Image',
    vi.fn(function FakeImage() {
      lastImage = { naturalHeight: 0, naturalWidth: 0, onload: null, src: '' };
      return lastImage;
    }),
  );

  return { getLastImage: () => lastImage };
};

const stubVideoConstructor = (naturalWidth: number, naturalHeight: number): { getLastVideo: () => HTMLVideoElement } => {
  const originalCreateElement = document.createElement.bind(document);
  let lastVideo = originalCreateElement('video') as HTMLVideoElement;

  vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
    const element = originalCreateElement(tagName);

    if (tagName === 'video') {
      Object.defineProperty(element, 'videoWidth', { configurable: true, value: naturalWidth });
      Object.defineProperty(element, 'videoHeight', { configurable: true, value: naturalHeight });
      lastVideo = element as HTMLVideoElement;
    }

    return element;
  });

  return { getLastVideo: () => lastVideo };
};

describe('loadArmedMedia', () => {
  beforeEach(() => {
    OBJECT_URLS_BY_FILE_HASH.clear();
    VIDEO_FRAMES_BY_FILE_HASH.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('should report the object URL and natural dimensions once the image loads', async () => {
    // mock
    URL.createObjectURL = vi.fn(() => 'blob:mock-url');

    const { getLastImage } = stubImageConstructor();
    const onLoad = vi.fn();
    const file = new File(['x'], 'photo.png', { type: 'image/png' });

    // before
    loadArmedMedia(file, onLoad);

    await vi.waitFor(() => expect(getLastImage().src).toBe('blob:mock-url'));

    const image = getLastImage();

    image.naturalWidth = 200;
    image.naturalHeight = 100;

    // action
    image.onload?.();

    // result
    expect(image.src).toBe('blob:mock-url');
    expect(onLoad).toHaveBeenCalledWith({ kind: 'image', naturalHeight: 100, naturalWidth: 200, src: 'blob:mock-url' });
  });

  it('should extract a video frame instead of loading the file as an image', async () => {
    // mock
    const drawImage = vi.fn();
    const file = new File(['x'], 'clip.mp4', { type: 'video/mp4' });
    const onLoad = vi.fn();

    URL.createObjectURL = vi
      .fn()
      .mockReturnValueOnce('blob:mock-source-url')
      .mockReturnValueOnce('blob:mock-video-url')
      .mockReturnValueOnce('blob:mock-frame-url');
    URL.revokeObjectURL = vi.fn();

    // spy
    const { getLastVideo } = stubVideoConstructor(160, 90);

    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ drawImage } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((callback) => callback(new Blob(['frame'])));

    // before
    loadArmedMedia(file, onLoad);

    await vi.waitFor(() => expect(getLastVideo().onloadeddata).not.toBeNull());

    // action
    getLastVideo().onloadeddata?.(new Event('loadeddata'));

    // result
    expect(onLoad).toHaveBeenCalledWith({ kind: 'video', naturalHeight: 90, naturalWidth: 160, src: 'blob:mock-frame-url' });
    expect(videoSrcUrlCache.get('blob:mock-frame-url')).toBe('blob:mock-source-url');
  });
});
