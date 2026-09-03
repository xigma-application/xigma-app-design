// utils
import { loadAllQueuedMedia } from '../loadAllQueuedMedia';
import { loadArmedMedia, TArmedMedia } from '../../loadArmedMedia';

vi.mock('../../loadArmedMedia', () => ({ loadArmedMedia: vi.fn() }));

describe('loadAllQueuedMedia', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should resolve every queued file through loadArmedMedia and prepend the armed media', async () => {
    // mock
    const armed: TArmedMedia = { naturalHeight: 50, naturalWidth: 100, src: 'blob:armed' };
    const fileA = new File(['a'], 'a.png');
    const fileB = new File(['b'], 'b.png');
    const loadedA: TArmedMedia = { naturalHeight: 10, naturalWidth: 20, src: 'blob:a' };
    const loadedB: TArmedMedia = { naturalHeight: 30, naturalWidth: 40, src: 'blob:b' };

    vi.mocked(loadArmedMedia).mockImplementation((file, onLoad) => onLoad(file === fileA ? loadedA : loadedB));

    // action
    const result = await loadAllQueuedMedia(armed, [fileA, fileB]);

    // result
    expect(result).toEqual([armed, loadedA, loadedB]);
  });

  it('should return only the queued media when nothing is armed', async () => {
    // mock
    const file = new File(['a'], 'a.png');
    const loaded: TArmedMedia = { naturalHeight: 10, naturalWidth: 20, src: 'blob:a' };

    vi.mocked(loadArmedMedia).mockImplementation((_, onLoad) => onLoad(loaded));

    // action
    const result = await loadAllQueuedMedia(null, [file]);

    // result
    expect(result).toEqual([loaded]);
  });

  it('should return an empty array when there is nothing armed or queued', async () => {
    // action
    const result = await loadAllQueuedMedia(null, []);

    // result
    expect(result).toEqual([]);
  });
});
