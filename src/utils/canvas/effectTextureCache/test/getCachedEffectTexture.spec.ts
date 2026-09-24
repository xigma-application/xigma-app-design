// types
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';

// others
import { EFFECT_TEXTURE_CACHE_MAX_BYTES } from '../constants';

// utils
import { getCachedEffectTexture } from '../getCachedEffectTexture';
import { getEffectTextureCache } from '../getEffectTextureCache';

const createGl = (): WebGL2RenderingContext =>
  ({ deleteFramebuffer: vi.fn(), deleteRenderbuffer: vi.fn(), deleteTexture: vi.fn() }) as unknown as WebGL2RenderingContext;

const createTarget = (width = 10, height = 10): TRenderTarget => ({
  framebuffer: {} as WebGLFramebuffer,
  height,
  stencil: {} as WebGLRenderbuffer,
  texture: {} as WebGLTexture,
  width,
});

describe('getCachedEffectTexture', () => {
  it('should build the texture on a miss, keep only its texture and release the framebuffer and stencil', () => {
    // mock
    const gl = createGl();
    const target = createTarget(10, 20);
    const build = vi.fn(() => target);

    // before
    const texture = getCachedEffectTexture(gl, 'key', build);

    // result
    expect(texture).toBe(target.texture);
    expect(build).toHaveBeenCalledTimes(1);
    expect(gl.deleteFramebuffer).toHaveBeenCalledWith(target.framebuffer);
    expect(gl.deleteRenderbuffer).toHaveBeenCalledWith(target.stencil);
    expect(gl.deleteTexture).not.toHaveBeenCalled();
    expect(getEffectTextureCache(gl).bytes).toBe(10 * 20 * 4);
  });

  it('should return the cached texture on a hit without building again', () => {
    // mock
    const gl = createGl();
    const build = vi.fn(() => createTarget());

    // before
    const first = getCachedEffectTexture(gl, 'key', build);
    const second = getCachedEffectTexture(gl, 'key', build);

    // result
    expect(second).toBe(first);
    expect(build).toHaveBeenCalledTimes(1);
  });

  it('should mark a hit as most recently used so it is evicted last', () => {
    // mock
    const gl = createGl();
    const side = Math.floor(Math.sqrt((EFFECT_TEXTURE_CACHE_MAX_BYTES / 4) * 0.4));
    const a = createTarget(side, side);
    const b = createTarget(side, side);
    const c = createTarget(side, side);

    // before
    getCachedEffectTexture(gl, 'a', () => a);
    getCachedEffectTexture(gl, 'b', () => b);
    getCachedEffectTexture(gl, 'a', () => a);
    getCachedEffectTexture(gl, 'c', () => c);

    // result
    expect(gl.deleteTexture).toHaveBeenCalledWith(b.texture);
    expect([...getEffectTextureCache(gl).entries.keys()]).toEqual(['a', 'c']);
  });
});
