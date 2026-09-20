// types
import { TMaskRenderer, TScissorRect } from './types';
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';

// utils
import { bindTarget } from './bindTarget';
import { setScissorRect } from './setScissorRect';

export const renderIntoTarget = (
  renderer: TMaskRenderer,
  target: TRenderTarget,
  paint: () => void,
  clearRect: TScissorRect | null = null,
): void => {
  const { gl } = renderer;

  bindTarget(renderer, target);
  setScissorRect(gl, clearRect);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
  setScissorRect(gl, null);
  paint();
};
