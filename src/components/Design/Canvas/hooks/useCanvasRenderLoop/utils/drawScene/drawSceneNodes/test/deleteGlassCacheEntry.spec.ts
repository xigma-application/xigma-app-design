// types
import { TGlassCacheEntry } from '../types';

// utils
import { createGlProxy } from 'test/createGlProxy';
import { deleteGlassCacheEntry } from '../deleteGlassCacheEntry';
import { glassCaches } from '../glassCaches';

const deleteResourcesMock = vi.fn();

vi.mock('../deleteGlassEntryResources', () => ({
  deleteGlassEntryResources: (...args: unknown[]): unknown => deleteResourcesMock(...args),
}));

describe('deleteGlassCacheEntry', () => {
  it('should free the resources of a cached node and forget it', () => {
    // mock
    const gl = createGlProxy();
    const entry = { texture: 'tex' } as unknown as TGlassCacheEntry;
    const cache = new Map([['n', entry]]);
    glassCaches.set(gl, cache);

    // before
    deleteGlassCacheEntry(gl, 'n');

    // result
    expect(deleteResourcesMock).toHaveBeenCalledWith(gl, entry);
    expect(cache.has('n')).toBe(false);
  });

  it('should do nothing for an uncached node or a context without a cache', () => {
    // mock
    const gl = createGlProxy();
    glassCaches.set(gl, new Map());
    deleteResourcesMock.mockClear();

    // before
    deleteGlassCacheEntry(gl, 'missing');
    deleteGlassCacheEntry(createGlProxy(), 'missing');

    // result
    expect(deleteResourcesMock).not.toHaveBeenCalled();
  });
});
