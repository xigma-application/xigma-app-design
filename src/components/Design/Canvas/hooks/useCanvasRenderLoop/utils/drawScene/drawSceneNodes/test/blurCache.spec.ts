// types
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';

// utils
import { blitBlurCacheEntry } from '../blitBlurCacheEntry';
import { deleteBlurCacheEntry } from '../deleteBlurCacheEntry';
import { getBlurCacheEntry } from '../getBlurCacheEntry';
import { storeBlurCacheEntry } from '../storeBlurCacheEntry';

const createGl = (): WebGL2RenderingContext =>
  ({
    COLOR_BUFFER_BIT: 16384,
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
const rect = { height: 4, originX: -2, originY: 6, width: 3, x: 0, y: 6 };

describe('blur cache', () => {
  it('should store the rect of a target and return it only for the same key', () => {
    // mock
    const gl = createGl();

    // action
    storeBlurCacheEntry(gl, 'n1', 'key-a', source, rect);

    // result
    expect(gl.blitFramebuffer).toHaveBeenCalledWith(0, 6, 3, 10, 0, 0, 3, 4, 16384, 9728);
    expect(getBlurCacheEntry(gl, 'n1', 'key-a')).toEqual(expect.objectContaining({ height: 4, width: 3 }));
    expect(getBlurCacheEntry(gl, 'n1', 'key-b')).toBeNull();
  });

  it('should free the previous texture when a node is stored again and when it is deleted', () => {
    // mock
    const gl = createGl();

    // action
    storeBlurCacheEntry(gl, 'n2', 'key-a', source, rect);
    storeBlurCacheEntry(gl, 'n2', 'key-b', source, rect);
    deleteBlurCacheEntry(gl, 'n2');

    // result
    expect(gl.deleteTexture).toHaveBeenCalledTimes(2);
    expect(getBlurCacheEntry(gl, 'n2', 'key-b')).toBeNull();
  });

  it('should blit a cached entry back at the unclamped origin of the rect', () => {
    // mock
    const gl = createGl();
    const target = { framebuffer: { tag: 'target' } } as unknown as TRenderTarget;

    storeBlurCacheEntry(gl, 'n3', 'key-a', source, rect);
    const entry = getBlurCacheEntry(gl, 'n3', 'key-a');

    // action
    blitBlurCacheEntry(gl, entry!, target, rect);

    // result
    expect(gl.blitFramebuffer).toHaveBeenLastCalledWith(0, 0, 3, 4, -2, 6, 1, 10, 16384, 9728);
  });
});
