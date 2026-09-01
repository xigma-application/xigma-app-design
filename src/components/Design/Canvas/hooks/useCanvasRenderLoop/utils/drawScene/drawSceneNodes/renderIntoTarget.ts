// utils
import { bindTarget } from './bindTarget';

// types
import { TMaskRenderer } from './types';
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';

export const renderIntoTarget = (renderer: TMaskRenderer, target: TRenderTarget, paint: () => void): void => {
  const { gl } = renderer;

  bindTarget(renderer, target);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
  paint();
};
