// types
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';

// utils
import { blurCaches } from '../blurCaches';
import { createGlProxy } from 'test/createGlProxy';
import { storeBlurCacheEntry } from '../storeBlurCacheEntry';

const deleteMock = vi.fn();
const evictMock = vi.fn();

vi.mock('../deleteBlurCacheEntry', () => ({ deleteBlurCacheEntry: (...args: unknown[]): unknown => deleteMock(...args) }));
vi.mock('../evictBlurCacheEntries', () => ({ evictBlurCacheEntries: (...args: unknown[]): unknown => evictMock(...args) }));

const source = { framebuffer: 'source-fb' } as unknown as TRenderTarget;

describe('storeBlurCacheEntry', () => {
  it('should copy the rect into a fresh texture and cache it, replacing the old entry and making room first', () => {
    // mock
    const gl = createGlProxy({ createFramebuffer: vi.fn(() => 'fb'), createTexture: vi.fn(() => 'tex') });

    // before
    storeBlurCacheEntry(gl, 'n', 'key', source, { clipped: true, height: 4, width: 3, x: 1, y: 2 }, 2);

    // result
    expect(deleteMock).toHaveBeenCalledWith(gl, 'n');
    expect(evictMock).toHaveBeenCalledWith(gl, blurCaches.get(gl), 48);
    expect(gl.blitFramebuffer).toHaveBeenCalledWith(1, 2, 4, 6, 0, 0, 3, 4, 'COLOR_BUFFER_BIT', 'NEAREST');
    expect(blurCaches.get(gl)?.get('n')).toEqual({
      clipped: true,
      framebuffer: 'fb',
      height: 4,
      key: 'key',
      texture: 'tex',
      width: 3,
      x: 1,
      y: 2,
      zoom: 2,
    });
  });

  it('should reuse the existing cache of the context and store an unclipped entry', () => {
    // mock
    const gl = createGlProxy();
    const cache = new Map();
    blurCaches.set(gl, cache);

    // before
    storeBlurCacheEntry(gl, 'm', 'key', source, { height: 1, width: 1, x: 0, y: 0 }, 1);

    // result
    expect(blurCaches.get(gl)).toBe(cache);
    expect(cache.get('m')).toMatchObject({ clipped: false });
  });
});
