// types
import { TBlurCacheEntry } from '../types';
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';

// utils
import { blitBlurCacheEntry } from '../blitBlurCacheEntry';
import { createGlProxy } from 'test/createGlProxy';

const target = { framebuffer: 'target-fb' } as unknown as TRenderTarget;
const entry = (extra: Partial<TBlurCacheEntry>): TBlurCacheEntry =>
  ({ clipped: false, framebuffer: 'entry-fb', height: 10, width: 20, x: 3, y: 4, zoom: 1, ...extra }) as unknown as TBlurCacheEntry;

describe('blitBlurCacheEntry', () => {
  it('should copy an unscaled entry centered on the rect with nearest filtering', () => {
    // mock
    const gl = createGlProxy();

    // before
    blitBlurCacheEntry(gl, entry({}), target, { height: 30, width: 40, x: 0, y: 0 }, 1);

    // result
    expect(gl.bindFramebuffer).toHaveBeenCalledWith('READ_FRAMEBUFFER', 'entry-fb');
    expect(gl.bindFramebuffer).toHaveBeenCalledWith('DRAW_FRAMEBUFFER', 'target-fb');
    expect(gl.blitFramebuffer).toHaveBeenCalledWith(0, 0, 20, 10, 10, 10, 30, 20, 'COLOR_BUFFER_BIT', 'NEAREST');
  });

  it('should scale an entry cached at another zoom around the raw rect center with linear filtering', () => {
    // mock
    const gl = createGlProxy();

    // before
    blitBlurCacheEntry(
      gl,
      entry({}),
      target,
      { height: 30, originX: -10, originY: -10, rawHeight: 40, rawWidth: 60, width: 40, x: 0, y: 0 },
      2,
    );

    // result
    expect(gl.blitFramebuffer).toHaveBeenCalledWith(0, 0, 20, 10, 0, 0, 40, 20, 'COLOR_BUFFER_BIT', 'LINEAR');
  });

  it('should put a clipped entry back exactly where it was cached', () => {
    // mock
    const gl = createGlProxy();

    // before
    blitBlurCacheEntry(gl, entry({ clipped: true }), target, { height: 30, width: 40, x: 0, y: 0 }, 3);

    // result
    expect(gl.blitFramebuffer).toHaveBeenCalledWith(0, 0, 20, 10, 3, 4, 23, 14, 'COLOR_BUFFER_BIT', 'NEAREST');
  });
});
