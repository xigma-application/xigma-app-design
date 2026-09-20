// types
import { TMaskRenderer } from './types';
import { TGlassBackdropState } from './glassBackdropStates';

export const releaseGlassBackdropTarget = (renderer: TMaskRenderer, state: TGlassBackdropState): void => {
  const { gl, pool } = renderer;

  if (state.backdrop) {
    if (state.isMipmapped) {
      gl.bindTexture(gl.TEXTURE_2D, state.backdrop.texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.bindTexture(gl.TEXTURE_2D, null);
    }

    pool.release(state.backdrop);
  }

  state.isMipmapped = false;
};
