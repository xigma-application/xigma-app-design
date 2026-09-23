// types
import { TGlassCacheEntry, TScissorRect } from '../types';

// utils
import { getGlassCacheHit } from '../getGlassCacheHit';
import { getGlassValidWindow } from '../getGlassValidWindow';
import { glassCaches } from '../glassCaches';

const gl = { tag: 'gl' } as unknown as WebGL2RenderingContext;
const RECT = { height: 80, width: 100, x: 10, y: 20 };
const NODES_STATE = { tag: 'nodes-state' };

const buildEntry = (rect: TScissorRect): TGlassCacheEntry => ({
  ...getGlassValidWindow(rect),
  framebuffer: {} as WebGLFramebuffer,
  height: rect.height,
  maskFramebuffer: {} as WebGLFramebuffer,
  maskTexture: {} as WebGLTexture,
  nodesState: NODES_STATE,
  rawHeight: rect.rawHeight ?? rect.height,
  rawWidth: rect.rawWidth ?? rect.width,
  texture: {} as WebGLTexture,
  width: rect.width,
});

const cacheEntry = (rect: TScissorRect): TGlassCacheEntry => {
  const entry = buildEntry(rect);

  glassCaches.set(gl, new Map([['r1', entry]]));

  return entry;
};

describe('getGlassCacheHit', () => {
  beforeEach(() => {
    glassCaches.delete(gl);
  });

  it('should be undefined when nothing is cached for the node yet', () => {
    // result
    expect(getGlassCacheHit(gl, 'r1', NODES_STATE, RECT)).toBeUndefined();
  });

  it('should return the entry when the nodes state and the size both match, even at a different position', () => {
    // mock — a pure pan moved the shape's screen rect, the cached content is still correct
    const entry = cacheEntry(RECT);

    // result
    expect(getGlassCacheHit(gl, 'r1', NODES_STATE, { ...RECT, x: RECT.x + 300, y: RECT.y - 50 })).toBe(entry);
  });

  it('should be undefined when the nodes state changed, even if the size is identical', () => {
    // mock
    cacheEntry(RECT);

    // result
    expect(getGlassCacheHit(gl, 'r1', { tag: 'a-different-nodes-state' }, RECT)).toBeUndefined();
  });

  it('should be undefined when the size changed, like from a zoom change, even with the same nodes state', () => {
    // mock
    cacheEntry(RECT);

    // result
    expect(getGlassCacheHit(gl, 'r1', NODES_STATE, { ...RECT, width: RECT.width + 5 })).toBeUndefined();
  });

  it('should still hit when the size flickers by one pixel from a fractional pan, but not by more', () => {
    // mock
    const entry = cacheEntry(RECT);

    // result
    expect(getGlassCacheHit(gl, 'r1', NODES_STATE, { ...RECT, height: RECT.height - 1, width: RECT.width + 1 })).toBe(entry);
    expect(getGlassCacheHit(gl, 'r1', NODES_STATE, { ...RECT, width: RECT.width + 2 })).toBeUndefined();
  });

  it('should hit for a rect cut by the screen edge while its visible part lies inside the cached window', () => {
    // mock — cached from the whole shape, now only its right half is on screen
    const entry = cacheEntry(RECT);

    // result
    expect(
      getGlassCacheHit(gl, 'r1', NODES_STATE, {
        clipped: true,
        height: 80,
        originX: -40,
        rawHeight: 80,
        rawWidth: 100,
        width: 50,
        x: 10,
        y: 20,
      }),
    ).toBe(entry);
  });

  it('should miss when the visible part of a cut rect reaches outside the cached window', () => {
    // mock — cached while only the left half was on screen, now the right half shows
    cacheEntry({ clipped: true, height: 80, originX: 10, rawHeight: 80, rawWidth: 100, width: 50, x: 10, y: 20 });

    // result
    expect(
      getGlassCacheHit(gl, 'r1', NODES_STATE, {
        clipped: true,
        height: 80,
        originX: -40,
        rawHeight: 80,
        rawWidth: 100,
        width: 50,
        x: 10,
        y: 20,
      }),
    ).toBeUndefined();
  });
});
