// types
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';

// utils
import { copyTargetRectToTexture } from '../copyTargetRectToTexture';
import { createGlProxy } from 'test/createGlProxy';

describe('copyTargetRectToTexture', () => {
  it('should copy the rect of the source into a new texture of the rect size and return it with its framebuffer', () => {
    // mock
    const texture = { tag: 'texture' };
    const framebuffer = { tag: 'framebuffer' };
    const gl = createGlProxy({ createFramebuffer: vi.fn(() => framebuffer), createTexture: vi.fn(() => texture) });

    // before
    const result = copyTargetRectToTexture(gl, { framebuffer: 'source-fb' } as unknown as TRenderTarget, {
      height: 4,
      width: 3,
      x: 1,
      y: 2,
    });

    // result
    expect(result).toEqual({ framebuffer, texture });
    expect(gl.texImage2D).toHaveBeenCalledWith('TEXTURE_2D', 0, 'RGBA', 3, 4, 0, 'RGBA', 'UNSIGNED_BYTE', null);
    expect(gl.framebufferTexture2D).toHaveBeenCalledWith('FRAMEBUFFER', 'COLOR_ATTACHMENT0', 'TEXTURE_2D', texture, 0);
    expect(gl.bindFramebuffer).toHaveBeenCalledWith('READ_FRAMEBUFFER', 'source-fb');
    expect(gl.blitFramebuffer).toHaveBeenCalledWith(1, 2, 4, 6, 0, 0, 3, 4, 'COLOR_BUFFER_BIT', 'NEAREST');
  });
});
