// types
import { TEffect, TSceneNode } from 'types/design/types';
import { TMaskRenderer, TScissorRect } from './types';
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';

// utils
import { blurIsolatedTarget } from './blurIsolatedTarget';
import { captureBackdropTexture } from './captureBackdropTexture';
import { drawGlassPass } from './drawGlassPass';
import { renderIntoTarget } from './renderIntoTarget';
import { setScissorRect } from './setScissorRect';

export const renderFreshGlassWarp = (
  renderer: TMaskRenderer,
  node: TSceneNode,
  effect: TEffect,
  rect: TScissorRect | null,
  frostRadius: number,
  warped: TRenderTarget,
): void => {
  const { gl, pool } = renderer;
  const backdrop = captureBackdropTexture(renderer, rect);

  gl.blendFunc(gl.ONE, gl.ZERO);
  renderIntoTarget(
    renderer,
    warped,
    () => {
      setScissorRect(gl, rect);
      drawGlassPass(renderer, node, effect, backdrop, warped);
      setScissorRect(gl, null);
    },
    rect,
  );
  gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  if (frostRadius > 0) {
    blurIsolatedTarget(renderer, warped, frostRadius, undefined, rect);
  }

  pool.release(backdrop);
};
