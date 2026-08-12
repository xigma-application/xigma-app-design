// utils
import { extractVideoFrame } from '../extractVideoFrame';

const stubVideoConstructor = (): { getLastVideo: () => HTMLVideoElement } => {
  let lastVideo: HTMLVideoElement | null = null;
  const originalCreateElement = document.createElement.bind(document);

  vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
    const element = originalCreateElement(tagName);

    if (tagName === 'video') {
      Object.defineProperty(element, 'videoWidth', { configurable: true, value: 0, writable: true });
      Object.defineProperty(element, 'videoHeight', { configurable: true, value: 0, writable: true });
      lastVideo = element as HTMLVideoElement;
    }

    return element;
  });

  return { getLastVideo: () => lastVideo as HTMLVideoElement };
};

describe('extractVideoFrame', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should append a hidden video, draw its loaded frame onto a canvas, and report it as a blob URL', () => {
    // mock
    const drawImage = vi.fn();
    const file = new File(['x'], 'clip.mp4', { type: 'video/mp4' });
    const onLoad = vi.fn();

    URL.createObjectURL = vi.fn().mockReturnValueOnce('blob:mock-video-url').mockReturnValueOnce('blob:mock-frame-url');
    URL.revokeObjectURL = vi.fn();

    // spy
    const { getLastVideo } = stubVideoConstructor();

    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ drawImage } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((callback) => callback(new Blob(['frame'])));

    // before
    extractVideoFrame(file, onLoad);

    const video = getLastVideo();

    Object.defineProperty(video, 'videoWidth', { value: 320 });
    Object.defineProperty(video, 'videoHeight', { value: 180 });

    // result (armed, before load completes)
    expect(URL.createObjectURL).toHaveBeenCalledWith(file);
    expect(video.src).toBe('blob:mock-video-url');
    expect(document.body.contains(video)).toBe(true);
    expect(video.style.opacity).toBe('0');

    // action
    video.onloadeddata?.(new Event('loadeddata'));

    // result
    expect(drawImage).toHaveBeenCalledWith(video, 0, 0, 320, 180);
    expect(onLoad).toHaveBeenCalledWith({ naturalHeight: 180, naturalWidth: 320, src: 'blob:mock-frame-url' });
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-video-url');
    expect(document.body.contains(video)).toBe(false);
  });

  it('should seek to a frame offset and wait for the seek to settle before capturing, when the video has a known duration', () => {
    // mock
    const drawImage = vi.fn();
    const file = new File(['x'], 'clip.mov', { type: 'video/quicktime' });
    const onLoad = vi.fn();

    URL.createObjectURL = vi.fn().mockReturnValueOnce('blob:mock-video-url').mockReturnValueOnce('blob:mock-frame-url');
    URL.revokeObjectURL = vi.fn();

    // spy
    const { getLastVideo } = stubVideoConstructor();

    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ drawImage } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((callback) => callback(new Blob(['frame'])));

    // before
    extractVideoFrame(file, onLoad);

    const video = getLastVideo();

    Object.defineProperty(video, 'duration', { value: 5 });
    Object.defineProperty(video, 'videoWidth', { value: 320 });
    Object.defineProperty(video, 'videoHeight', { value: 180 });

    // action
    video.onloadeddata?.(new Event('loadeddata'));

    // result (draws only once the seek settles, not immediately on loadeddata)
    expect(drawImage).not.toHaveBeenCalled();
    expect(video.currentTime).toBe(0.1);

    video.onseeked?.(new Event('seeked'));

    expect(drawImage).toHaveBeenCalledWith(video, 0, 0, 320, 180);
    expect(onLoad).toHaveBeenCalledWith({ naturalHeight: 180, naturalWidth: 320, src: 'blob:mock-frame-url' });
    expect(document.body.contains(video)).toBe(false);
  });

  it('should not report a frame when the canvas fails to produce a blob', () => {
    // mock
    const drawImage = vi.fn();
    const file = new File(['x'], 'clip.mp4', { type: 'video/mp4' });
    const onLoad = vi.fn();

    URL.createObjectURL = vi.fn(() => 'blob:mock-video-url');
    URL.revokeObjectURL = vi.fn();

    // spy
    const { getLastVideo } = stubVideoConstructor();

    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ drawImage } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((callback) => callback(null));

    // before
    extractVideoFrame(file, onLoad);

    // action
    getLastVideo().onloadeddata?.(new Event('loadeddata'));

    // result
    expect(onLoad).not.toHaveBeenCalled();
  });

  it('should do nothing when the canvas has no 2D context', () => {
    // mock
    const file = new File(['x'], 'clip.mp4', { type: 'video/mp4' });
    const onLoad = vi.fn();

    URL.createObjectURL = vi.fn(() => 'blob:mock-video-url');
    URL.revokeObjectURL = vi.fn();

    // spy
    const { getLastVideo } = stubVideoConstructor();

    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);

    // before
    extractVideoFrame(file, onLoad);

    // action
    getLastVideo().onloadeddata?.(new Event('loadeddata'));

    // result
    expect(onLoad).not.toHaveBeenCalled();
  });

  it('should clean up the video element and log an error when it fails to load', () => {
    // mock
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const file = new File(['x'], 'clip.mp4', { type: 'video/mp4' });
    const onLoad = vi.fn();

    URL.createObjectURL = vi.fn(() => 'blob:mock-video-url');
    URL.revokeObjectURL = vi.fn();

    // spy
    const { getLastVideo } = stubVideoConstructor();

    // before
    extractVideoFrame(file, onLoad);

    const video = getLastVideo();

    // action
    video.onerror?.(new Event('error'));

    // result
    expect(onLoad).not.toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-video-url');
    expect(document.body.contains(video)).toBe(false);
    expect(consoleError).toHaveBeenCalledWith('Failed to load video for frame extraction', 'clip.mp4');
  });
});
