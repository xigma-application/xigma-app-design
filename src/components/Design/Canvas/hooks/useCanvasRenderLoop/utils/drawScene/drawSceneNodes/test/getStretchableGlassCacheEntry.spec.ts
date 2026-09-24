// types
import { TGlassCacheEntry } from '../types';

// utils
import { getStretchableGlassCacheEntry } from '../getStretchableGlassCacheEntry';
import { glassCaches } from '../glassCaches';

const gl = { tag: 'gl' } as unknown as WebGL2RenderingContext;
const STATE = { tag: 'state' };
const RECT = { height: 50, width: 80, x: 0, y: 0 };

const cache = (overrides: Partial<TGlassCacheEntry> = {}): TGlassCacheEntry => {
  const entry = {
    height: 50,
    localX: 0,
    localY: 0,
    nodesState: STATE,
    rawHeight: 50,
    rawWidth: 80,
    width: 80,
    ...overrides,
  } as TGlassCacheEntry;

  glassCaches.set(gl, new Map([['key', entry]]));

  return entry;
};

describe('getStretchableGlassCacheEntry', () => {
  beforeEach(() => {
    glassCaches.delete(gl);
  });

  it('should be undefined without an entry', () => {
    // result
    expect(getStretchableGlassCacheEntry(gl, 'key', STATE, RECT)).toBeUndefined();
  });

  it('should return a fully captured entry of the same nodes state whatever the size', () => {
    // mock
    const entry = cache();

    // result
    expect(getStretchableGlassCacheEntry(gl, 'key', STATE, { ...RECT, height: 20, width: 30 })).toBe(entry);
  });

  it('should reject an entry of another nodes state', () => {
    // mock
    cache();

    // result
    expect(getStretchableGlassCacheEntry(gl, 'key', { tag: 'other' }, RECT)).toBeUndefined();
  });

  it('should reject a clipped rect', () => {
    // mock
    cache();

    // result
    expect(getStretchableGlassCacheEntry(gl, 'key', STATE, { ...RECT, clipped: true })).toBeUndefined();
  });

  it.each([
    ['an offset window on x', { localX: 4 }],
    ['an offset window on y', { localY: 4 }],
    ['a clipped width', { width: 70 }],
    ['a clipped height', { height: 40 }],
  ])('should reject an entry captured with %s', (_, overrides) => {
    // mock
    cache(overrides);

    // result
    expect(getStretchableGlassCacheEntry(gl, 'key', STATE, RECT)).toBeUndefined();
  });
});
