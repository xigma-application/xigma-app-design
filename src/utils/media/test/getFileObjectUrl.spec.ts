// others
import { OBJECT_URLS_BY_FILE_HASH } from '../constants';

// utils
import { getFileObjectUrl } from '../getFileObjectUrl';

describe('getFileObjectUrl', () => {
  beforeEach(() => {
    OBJECT_URLS_BY_FILE_HASH.clear();
    URL.createObjectURL = vi.fn().mockReturnValueOnce('blob:first').mockReturnValueOnce('blob:second');
  });

  it('should reuse the object URL of a file with the same content, even under another name', async () => {
    // action
    const first = await getFileObjectUrl(new File(['same'], 'a.png', { type: 'image/png' }));
    const second = await getFileObjectUrl(new File(['same'], 'b.png', { type: 'image/png' }));

    // result
    expect([first, second]).toEqual(['blob:first', 'blob:first']);
    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
  });

  it('should create a new object URL for a file with different content', async () => {
    // action
    const first = await getFileObjectUrl(new File(['one'], 'a.png', { type: 'image/png' }));
    const second = await getFileObjectUrl(new File(['two'], 'a.png', { type: 'image/png' }));

    // result
    expect([first, second]).toEqual(['blob:first', 'blob:second']);
  });
});
