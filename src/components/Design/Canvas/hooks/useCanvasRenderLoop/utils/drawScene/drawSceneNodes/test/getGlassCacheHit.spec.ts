// utils
import { getGlassCacheHit } from '../getGlassCacheHit';
import { glassCaches } from '../glassCaches';

const gl = { tag: 'gl' } as unknown as WebGL2RenderingContext;
const RECT = { height: 80, width: 100, x: 10, y: 20 };
const NODES_STATE = { tag: 'nodes-state' };

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
    const entry = {
      framebuffer: {} as WebGLFramebuffer,
      maskFramebuffer: {} as WebGLFramebuffer,
      maskTexture: {} as WebGLTexture,
      nodesState: NODES_STATE,
      texture: {} as WebGLTexture,
      ...RECT,
    };

    glassCaches.set(gl, new Map([['r1', entry]]));

    // result
    expect(getGlassCacheHit(gl, 'r1', NODES_STATE, { ...RECT, x: RECT.x + 300, y: RECT.y - 50 })).toBe(entry);
  });

  it('should be undefined when the nodes state changed, even if the size is identical', () => {
    // mock
    const entry = {
      framebuffer: {} as WebGLFramebuffer,
      maskFramebuffer: {} as WebGLFramebuffer,
      maskTexture: {} as WebGLTexture,
      nodesState: NODES_STATE,
      texture: {} as WebGLTexture,
      ...RECT,
    };

    glassCaches.set(gl, new Map([['r1', entry]]));

    // result
    expect(getGlassCacheHit(gl, 'r1', { tag: 'a-different-nodes-state' }, RECT)).toBeUndefined();
  });

  it('should be undefined when the size changed, like from a zoom change, even with the same nodes state', () => {
    // mock
    const entry = {
      framebuffer: {} as WebGLFramebuffer,
      maskFramebuffer: {} as WebGLFramebuffer,
      maskTexture: {} as WebGLTexture,
      nodesState: NODES_STATE,
      texture: {} as WebGLTexture,
      ...RECT,
    };

    glassCaches.set(gl, new Map([['r1', entry]]));

    // result
    expect(getGlassCacheHit(gl, 'r1', NODES_STATE, { ...RECT, width: RECT.width + 5 })).toBeUndefined();
  });

  it('should still hit when the size flickers by one pixel from a fractional pan, but not by more', () => {
    // mock
    const entry = {
      framebuffer: {} as WebGLFramebuffer,
      maskFramebuffer: {} as WebGLFramebuffer,
      maskTexture: {} as WebGLTexture,
      nodesState: NODES_STATE,
      texture: {} as WebGLTexture,
      ...RECT,
    };

    glassCaches.set(gl, new Map([['r1', entry]]));

    // result
    expect(getGlassCacheHit(gl, 'r1', NODES_STATE, { ...RECT, height: RECT.height - 1, width: RECT.width + 1 })).toBe(entry);
    expect(getGlassCacheHit(gl, 'r1', NODES_STATE, { ...RECT, width: RECT.width + 2 })).toBeUndefined();
  });

  it('should never hit for a rect cut by the screen edge, since it only shows part of the shape', () => {
    // mock
    const entry = {
      framebuffer: {} as WebGLFramebuffer,
      maskFramebuffer: {} as WebGLFramebuffer,
      maskTexture: {} as WebGLTexture,
      nodesState: NODES_STATE,
      texture: {} as WebGLTexture,
      ...RECT,
    };

    glassCaches.set(gl, new Map([['r1', entry]]));

    // result
    expect(getGlassCacheHit(gl, 'r1', NODES_STATE, { ...RECT, clipped: true })).toBeUndefined();
  });
});
