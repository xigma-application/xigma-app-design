// types
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';

// utils
import { BLUR_CACHE_MAX_ENTRIES } from '../blurCaches';
import { blitBlurCacheEntry } from '../blitBlurCacheEntry';
import { deleteBlurCacheEntry } from '../deleteBlurCacheEntry';
import { getBlurCacheEntry } from '../getBlurCacheEntry';
import { storeBlurCacheEntry } from '../storeBlurCacheEntry';

const createGl = (): WebGL2RenderingContext =>
  ({
    COLOR_BUFFER_BIT: 16384,
    LINEAR: 9729,
    NEAREST: 9728,
    bindFramebuffer: vi.fn(),
    bindTexture: vi.fn(),
    blitFramebuffer: vi.fn(),
    createFramebuffer: vi.fn(() => ({ tag: 'fb' })),
    createTexture: vi.fn(() => ({ tag: 'tex' })),
    deleteFramebuffer: vi.fn(),
    deleteTexture: vi.fn(),
    framebufferTexture2D: vi.fn(),
    texImage2D: vi.fn(),
    texParameteri: vi.fn(),
  }) as unknown as WebGL2RenderingContext;

const source = { framebuffer: { tag: 'source' } } as unknown as TRenderTarget;
const rect = { height: 4, originX: -2, originY: 6, rawHeight: 4, rawWidth: 5, width: 3, x: 0, y: 6 };

describe('blur cache', () => {
  it('should store the rect of a target and return it only for the same key', () => {
    // mock
    const gl = createGl();

    // action
    storeBlurCacheEntry(gl, 'n1', 'key-a', source, rect, 1);

    // result
    expect(gl.blitFramebuffer).toHaveBeenCalledWith(0, 6, 3, 10, 0, 0, 3, 4, 16384, 9728);
    expect(getBlurCacheEntry(gl, 'n1', 'key-a')).toEqual(expect.objectContaining({ height: 4, width: 3 }));
    expect(getBlurCacheEntry(gl, 'n1', 'key-b')).toBeNull();
  });

  it('should free the previous texture when a node is stored again and when it is deleted', () => {
    // mock
    const gl = createGl();

    // action
    storeBlurCacheEntry(gl, 'n2', 'key-a', source, rect, 1);
    storeBlurCacheEntry(gl, 'n2', 'key-b', source, rect, 1);
    deleteBlurCacheEntry(gl, 'n2');

    // result
    expect(gl.deleteTexture).toHaveBeenCalledTimes(2);
    expect(getBlurCacheEntry(gl, 'n2', 'key-b')).toBeNull();
  });

  it('should blit a cached entry back at the unclamped origin of the rect', () => {
    // mock
    const gl = createGl();
    const target = { framebuffer: { tag: 'target' } } as unknown as TRenderTarget;

    storeBlurCacheEntry(gl, 'n3', 'key-a', source, rect, 1);
    const entry = getBlurCacheEntry(gl, 'n3', 'key-a');

    // action
    blitBlurCacheEntry(gl, entry!, target, rect, 1);

    // result
    expect(gl.blitFramebuffer).toHaveBeenLastCalledWith(0, 0, 3, 4, -1, 6, 2, 10, 16384, 9728);
  });
});

describe('blur cache scaling', () => {
  it('should stretch an entry stored at another zoom around the rect center with linear filtering', () => {
    // mock
    const gl = createGl();
    const target = { framebuffer: { tag: 'target' } } as unknown as TRenderTarget;

    storeBlurCacheEntry(gl, 'z1', 'key-a', source, rect, 1);
    const entry = getBlurCacheEntry(gl, 'z1', 'key-a');

    // action
    blitBlurCacheEntry(gl, entry!, target, rect, 2);

    // result — 3x4 becomes 6x8, centered on x = -2 + 5 / 2, y = 6 + 4 / 2
    expect(gl.blitFramebuffer).toHaveBeenLastCalledWith(0, 0, 3, 4, -2, 4, 4, 12, 16384, 9729);
  });
});

describe('blur cache eviction', () => {
  it('should evict the least recently used node, not the oldest stored one', () => {
    // mock
    const gl = createGl();

    for (let i = 0; i < BLUR_CACHE_MAX_ENTRIES; i += 1) {
      storeBlurCacheEntry(gl, `lru-${i}`, 'key', source, rect, 1);
    }

    // action — touching the first node makes the second one the oldest
    getBlurCacheEntry(gl, 'lru-0', 'key');
    storeBlurCacheEntry(gl, 'lru-new', 'key', source, rect, 1);

    // result
    expect(getBlurCacheEntry(gl, 'lru-0', 'key')).not.toBeNull();
    expect(getBlurCacheEntry(gl, 'lru-1', 'key')).toBeNull();
    expect(getBlurCacheEntry(gl, 'lru-new', 'key')).not.toBeNull();
  });

  it('should evict the oldest entries when the stored pixels exceed the memory budget', () => {
    // mock
    const gl = createGl();
    const large = { height: 2000, width: 4000, x: 0, y: 0 };

    // action — each entry is 32 MB, the budget is 128 MB
    for (let i = 0; i < 5; i += 1) {
      storeBlurCacheEntry(gl, `big-${i}`, 'key', source, large, 1);
    }

    // result
    expect(getBlurCacheEntry(gl, 'big-0', 'key')).toBeNull();
    expect(getBlurCacheEntry(gl, 'big-1', 'key')).not.toBeNull();
    expect(getBlurCacheEntry(gl, 'big-4', 'key')).not.toBeNull();
  });
});
