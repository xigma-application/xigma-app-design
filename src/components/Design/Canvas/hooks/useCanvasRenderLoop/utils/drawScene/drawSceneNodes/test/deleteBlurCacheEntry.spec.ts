// types
import { TBlurCacheEntry } from '../types';

// utils
import { blurCaches } from '../blurCaches';
import { createGlProxy } from 'test/createGlProxy';
import { deleteBlurCacheEntry } from '../deleteBlurCacheEntry';

describe('deleteBlurCacheEntry', () => {
  it('should free the GL resources of a cached node and forget it', () => {
    // mock
    const gl = createGlProxy();
    const cache = new Map([['n', { framebuffer: 'fb', texture: 'tex' } as unknown as TBlurCacheEntry]]);
    blurCaches.set(gl, cache);

    // before
    deleteBlurCacheEntry(gl, 'n');

    // result
    expect(gl.deleteFramebuffer).toHaveBeenCalledWith('fb');
    expect(gl.deleteTexture).toHaveBeenCalledWith('tex');
    expect(cache.has('n')).toBe(false);
  });

  it('should do nothing for an uncached node or a context without a cache', () => {
    // mock
    const gl = createGlProxy();
    const otherGl = createGlProxy();
    blurCaches.set(gl, new Map());

    // before
    deleteBlurCacheEntry(gl, 'missing');
    deleteBlurCacheEntry(otherGl, 'missing');

    // result
    expect(gl.deleteTexture).not.toHaveBeenCalled();
    expect(otherGl.deleteTexture).not.toHaveBeenCalled();
  });
});
