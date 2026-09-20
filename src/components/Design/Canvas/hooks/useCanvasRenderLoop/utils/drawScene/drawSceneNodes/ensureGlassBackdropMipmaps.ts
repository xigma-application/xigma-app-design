// types
import { TMaskRenderer } from './types';
import { TGlassBackdropState } from './glassBackdropStates';

export const ensureGlassBackdropMipmaps = (renderer: TMaskRenderer, state: TGlassBackdropState): void => {
  const { gl } = renderer;

  if (state.backdrop && !state.isMipmapped) {
    gl.bindTexture(gl.TEXTURE_2D, state.backdrop.texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);
    state.isMipmapped = true;
  }
};
