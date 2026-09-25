// types
import { TGlassBackdropState } from '../glassBackdropStates';
import { TMaskRenderer } from '../types';
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';

// utils
import { createGlProxy } from 'test/createGlProxy';
import { ensureGlassBackdropMipmaps } from '../ensureGlassBackdropMipmaps';

const state = (backdrop: TRenderTarget | null, isMipmapped: boolean): TGlassBackdropState => ({
  backdrop,
  dirty: [],
  fullyDirty: false,
  isMipmapped,
});

describe('ensureGlassBackdropMipmaps', () => {
  it('should generate mipmaps for the backdrop once', () => {
    // mock
    const gl = createGlProxy();
    const backdropState = state({ texture: 'tex' } as unknown as TRenderTarget, false);

    // before
    ensureGlassBackdropMipmaps({ gl } as unknown as TMaskRenderer, backdropState);
    ensureGlassBackdropMipmaps({ gl } as unknown as TMaskRenderer, backdropState);

    // result
    expect(gl.generateMipmap).toHaveBeenCalledTimes(1);
    expect(gl.texParameteri).toHaveBeenCalledWith('TEXTURE_2D', 'TEXTURE_MIN_FILTER', 'LINEAR_MIPMAP_LINEAR');
    expect(backdropState.isMipmapped).toBe(true);
  });

  it('should do nothing without a backdrop', () => {
    // mock
    const gl = createGlProxy();

    // before
    ensureGlassBackdropMipmaps({ gl } as unknown as TMaskRenderer, state(null, false));

    // result
    expect(gl.generateMipmap).not.toHaveBeenCalled();
  });
});
