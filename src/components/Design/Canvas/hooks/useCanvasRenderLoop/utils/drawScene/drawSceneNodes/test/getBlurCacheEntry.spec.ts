// types
import { TBlurCacheEntry } from '../types';

// utils
import { blurCaches } from '../blurCaches';
import { createGlProxy } from 'test/createGlProxy';
import { getBlurCacheEntry } from '../getBlurCacheEntry';

describe('getBlurCacheEntry', () => {
  it('should return a matching entry and mark it as most recently used', () => {
    // mock
    const gl = createGlProxy();
    const entry = { key: 'k' } as TBlurCacheEntry;
    const cache = new Map([
      ['n', entry],
      ['other', { key: 'x' } as TBlurCacheEntry],
    ]);
    blurCaches.set(gl, cache);

    // result
    expect(getBlurCacheEntry(gl, 'n', 'k')).toBe(entry);
    expect([...cache.keys()]).toEqual(['other', 'n']);
  });

  it('should return nothing for a stale key, a missing node or a context without a cache', () => {
    // mock
    const gl = createGlProxy();
    blurCaches.set(gl, new Map([['n', { key: 'k' } as TBlurCacheEntry]]));

    // result
    expect(getBlurCacheEntry(gl, 'n', 'stale')).toBeNull();
    expect(getBlurCacheEntry(gl, 'missing', 'k')).toBeNull();
    expect(getBlurCacheEntry(createGlProxy(), 'n', 'k')).toBeNull();
  });
});
