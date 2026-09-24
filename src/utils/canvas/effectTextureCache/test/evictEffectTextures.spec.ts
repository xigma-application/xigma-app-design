// types
import { TEffectTextureCache } from '../types';

// others
import { EFFECT_TEXTURE_CACHE_MAX_BYTES } from '../constants';

// utils
import { evictEffectTextures } from '../evictEffectTextures';

const createGl = (): WebGL2RenderingContext => ({ deleteTexture: vi.fn() }) as unknown as WebGL2RenderingContext;

describe('evictEffectTextures', () => {
  it('should do nothing while the cache is within budget', () => {
    // mock
    const gl = createGl();
    const cache: TEffectTextureCache = { bytes: 10, entries: new Map([['a', { bytes: 10, texture: {} as WebGLTexture }]]) };

    // before
    evictEffectTextures(gl, cache);

    // result
    expect(gl.deleteTexture).not.toHaveBeenCalled();
    expect(cache.entries.size).toBe(1);
  });

  it('should delete the oldest textures first until the cache fits the budget', () => {
    // mock
    const gl = createGl();
    const oldest = {} as WebGLTexture;
    const newest = {} as WebGLTexture;
    const half = EFFECT_TEXTURE_CACHE_MAX_BYTES / 2 + 1;
    const cache: TEffectTextureCache = {
      bytes: half * 2,
      entries: new Map([
        ['old', { bytes: half, texture: oldest }],
        ['new', { bytes: half, texture: newest }],
      ]),
    };

    // before
    evictEffectTextures(gl, cache);

    // result
    expect(gl.deleteTexture).toHaveBeenCalledTimes(1);
    expect(gl.deleteTexture).toHaveBeenCalledWith(oldest);
    expect([...cache.entries.keys()]).toEqual(['new']);
    expect(cache.bytes).toBe(half);
  });

  it('should always keep the last remaining entry even when it alone exceeds the budget', () => {
    // mock
    const gl = createGl();
    const cache: TEffectTextureCache = {
      bytes: EFFECT_TEXTURE_CACHE_MAX_BYTES * 2,
      entries: new Map([['only', { bytes: EFFECT_TEXTURE_CACHE_MAX_BYTES * 2, texture: {} as WebGLTexture }]]),
    };

    // before
    evictEffectTextures(gl, cache);

    // result
    expect(gl.deleteTexture).not.toHaveBeenCalled();
    expect(cache.entries.size).toBe(1);
  });
});
