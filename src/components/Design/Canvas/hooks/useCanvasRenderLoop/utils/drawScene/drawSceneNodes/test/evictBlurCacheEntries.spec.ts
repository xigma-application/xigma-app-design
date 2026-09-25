// types
import { TBlurCacheEntry } from '../types';

// utils
import { createGlProxy } from 'test/createGlProxy';
import { evictBlurCacheEntries } from '../evictBlurCacheEntries';

const deleteMock = vi.fn();

vi.mock('../blurCaches', () => ({ BLUR_CACHE_BYTES_PER_PIXEL: 1, BLUR_CACHE_MAX_BYTES: 100, BLUR_CACHE_MAX_ENTRIES: 3 }));
vi.mock('../deleteBlurCacheEntry', () => ({
  deleteBlurCacheEntry: (_gl: unknown, key: string): void => {
    deleteMock(key);
    cache.delete(key);
  },
}));

const cache = new Map<string, TBlurCacheEntry>();
const entry = (size: number): TBlurCacheEntry => ({ height: size, width: 1 }) as TBlurCacheEntry;

describe('evictBlurCacheEntries', () => {
  beforeEach(() => {
    cache.clear();
    deleteMock.mockClear();
  });

  it('should drop the oldest entries until the count is under the limit', () => {
    // mock
    cache.set('a', entry(1)).set('b', entry(1)).set('c', entry(1));

    // before
    evictBlurCacheEntries(createGlProxy(), cache, 0);

    // result
    expect(deleteMock.mock.calls).toEqual([['a']]);
  });

  it('should drop the oldest entries until the incoming bytes fit', () => {
    // mock
    cache.set('a', entry(40)).set('b', entry(40));

    // before
    evictBlurCacheEntries(createGlProxy(), cache, 50);

    // result
    expect(deleteMock.mock.calls).toEqual([['a']]);
  });

  it('should keep everything when the cache has room, and stop once it is empty', () => {
    // mock
    cache.set('a', entry(10));

    // before
    evictBlurCacheEntries(createGlProxy(), cache, 10);
    evictBlurCacheEntries(createGlProxy(), new Map(), 1000);

    // result
    expect(deleteMock).not.toHaveBeenCalled();
  });
});
