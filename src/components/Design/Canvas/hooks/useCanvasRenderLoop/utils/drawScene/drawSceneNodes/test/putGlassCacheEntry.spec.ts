// types
import { TGlassCacheEntry } from '../types';

// utils
import { GLASS_CACHE_MAX_ENTRIES, glassCaches } from '../glassCaches';
import { putGlassCacheEntry } from '../putGlassCacheEntry';

const createGl = (): WebGL2RenderingContext =>
  ({ deleteFramebuffer: vi.fn(), deleteTexture: vi.fn() }) as unknown as WebGL2RenderingContext;

const createEntry = (width = 4, height = 4): TGlassCacheEntry =>
  ({ framebuffer: {}, height, maskFramebuffer: {}, maskTexture: {}, texture: {}, width }) as unknown as TGlassCacheEntry;

describe('putGlassCacheEntry', () => {
  it('should store an entry per node and free the previous one of the same node', () => {
    // mock
    const gl = createGl();
    const first = createEntry();
    const second = createEntry();

    // before
    putGlassCacheEntry(gl, 'n1', first);
    putGlassCacheEntry(gl, 'n1', second);

    // result
    expect(glassCaches.get(gl)?.get('n1')).toBe(second);
    expect(gl.deleteTexture).toHaveBeenCalledWith(first.texture);
    expect(gl.deleteTexture).toHaveBeenCalledWith(first.maskTexture);
  });

  it('should evict the oldest node once the entry count limit is reached', () => {
    // mock
    const gl = createGl();

    // before
    for (let index = 0; index < GLASS_CACHE_MAX_ENTRIES + 1; index += 1) {
      putGlassCacheEntry(gl, `n${index}`, createEntry(1, 1));
    }

    // result
    expect(glassCaches.get(gl)?.has('n0')).toBe(false);
    expect(glassCaches.get(gl)?.has(`n${GLASS_CACHE_MAX_ENTRIES}`)).toBe(true);
    expect(glassCaches.get(gl)?.size).toBe(GLASS_CACHE_MAX_ENTRIES);
  });

  it('should evict the oldest nodes when the stored pixels exceed the memory budget', () => {
    // mock
    const gl = createGl();

    // before — each entry holds two 4000x2000 textures (64 MB), the budget is 128 MB
    for (let index = 0; index < 3; index += 1) {
      putGlassCacheEntry(gl, `big-${index}`, createEntry(4000, 2000));
    }

    // result
    expect(glassCaches.get(gl)?.has('big-0')).toBe(false);
    expect(glassCaches.get(gl)?.has('big-1')).toBe(true);
    expect(glassCaches.get(gl)?.has('big-2')).toBe(true);
  });
});
