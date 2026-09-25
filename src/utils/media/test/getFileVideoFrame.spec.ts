// others
import { VIDEO_FRAMES_BY_FILE_HASH } from '../constants';

// utils
import { getFileVideoFrame } from '../getFileVideoFrame';

const extractVideoFrameMock = vi.fn();

vi.mock('../getFileHash', () => ({ getFileHash: async (file: File): Promise<string> => file.name }));
vi.mock('utils/canvas/extractVideoFrame', () => ({ extractVideoFrame: (...args: unknown[]): unknown => extractVideoFrameMock(...args) }));

const FRAME = { naturalHeight: 1, naturalWidth: 2, src: 'frame.png' };

describe('getFileVideoFrame', () => {
  it('should extract the first frame once, cache it by file hash and hand it over', async () => {
    // mock
    const onLoad = vi.fn();
    const file = new File([''], 'clip-a.mp4');
    extractVideoFrameMock.mockImplementation((_file: File, done: (frame: typeof FRAME) => void) => done(FRAME));

    // before
    await getFileVideoFrame(file, onLoad);

    // result
    expect(onLoad).toHaveBeenCalledWith(FRAME);
    expect(VIDEO_FRAMES_BY_FILE_HASH.get('clip-a.mp4')).toBe(FRAME);
  });

  it('should hand over a cached frame without extracting again', async () => {
    // mock
    const onLoad = vi.fn();
    VIDEO_FRAMES_BY_FILE_HASH.set('clip-b.mp4', FRAME);
    extractVideoFrameMock.mockClear();

    // before
    await getFileVideoFrame(new File([''], 'clip-b.mp4'), onLoad);

    // result
    expect(onLoad).toHaveBeenCalledWith(FRAME);
    expect(extractVideoFrameMock).not.toHaveBeenCalled();
  });
});
