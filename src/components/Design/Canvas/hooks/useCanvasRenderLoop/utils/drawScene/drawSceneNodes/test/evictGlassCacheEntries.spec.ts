// types
import { TGlassCacheEntry } from '../types';

// utils
import { createGlProxy } from 'test/createGlProxy';
import { evictGlassCacheEntries } from '../evictGlassCacheEntries';

const deleteMock = vi.fn();

vi.mock('../glassCaches', () => ({ GLASS_CACHE_BYTES_PER_PIXEL: 1, GLASS_CACHE_MAX_BYTES: 100, GLASS_CACHE_MAX_ENTRIES: 3 }));
vi.mock('../deleteGlassCacheEntry', () => ({
  deleteGlassCacheEntry: (_gl: unknown, key: string): void => {
    deleteMock(key);
    cache.delete(key);
  },
}));

const cache = new Map<string, TGlassCacheEntry>();
const entry = (size: number): TGlassCacheEntry => ({ height: size, width: 1 }) as TGlassCacheEntry;

describe('evictGlassCacheEntries', () => {
  beforeEach(() => {
    cache.clear();
    deleteMock.mockClear();
  });

  it('should drop the oldest entries until the count is under the limit', () => {
    // mock
    cache.set('a', entry(1)).set('b', entry(1)).set('c', entry(1));

    // before
    evictGlassCacheEntries(createGlProxy(), cache, 0);

    // result
    expect(deleteMock.mock.calls).toEqual([['a']]);
  });

  it('should drop the oldest entries until the incoming bytes fit, and keep the rest', () => {
    // mock
    cache.set('a', entry(40)).set('b', entry(40));

    // before
    evictGlassCacheEntries(createGlProxy(), cache, 50);
    evictGlassCacheEntries(createGlProxy(), new Map(), 1000);

    // result
    expect(deleteMock.mock.calls).toEqual([['a']]);
  });
});
