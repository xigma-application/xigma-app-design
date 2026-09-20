// types
import { TEffect, TSceneNode } from 'types/design/types';
import { TMaskRenderer, TScissorRect } from './types';
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';

// utils
import { bindTarget } from './bindTarget';
import { compositeMask } from '../compositeMask';
import { EFFECT_BLUR_MAX_PX } from '../drawBoxLeafNode/constants';
import { getEffectGlass } from 'utils/design/effects/getEffectGlass';
import { getLayerBlurRadius } from './getLayerBlurRadius';
import { paintBackgroundBlurShape } from './paintBackgroundBlurShape';
import { renderFreshGlassWarp } from './renderFreshGlassWarp';
import { renderIntoTarget } from './renderIntoTarget';
import { setScissorRect } from './setScissorRect';
import { storeGlassCacheEntry } from './storeGlassCacheEntry';

export const renderFreshGlass = (
  renderer: TMaskRenderer,
  node: TSceneNode,
  effect: TEffect,
  target: TRenderTarget | null,
  rect: TScissorRect | null,
  nodesState: unknown,
): void => {
  const { context, gl, pool } = renderer;
  const warped = pool.acquire();
  const mask = pool.acquire();
  const frostRadius = getLayerBlurRadius(renderer, (getEffectGlass(effect).frost / 100) * EFFECT_BLUR_MAX_PX);

  renderFreshGlassWarp(renderer, node, effect, rect, frostRadius, warped);
  renderIntoTarget(
    renderer,
    mask,
    () => {
      setScissorRect(gl, rect);
      paintBackgroundBlurShape(renderer, node);
      setScissorRect(gl, null);
    },
    rect,
  );

  if (rect) {
    storeGlassCacheEntry(gl, node.id, nodesState, warped, mask, rect);
  }

  bindTarget(renderer, target);
  setScissorRect(gl, rect);
  compositeMask(context, warped.texture, mask.texture);
  setScissorRect(gl, null);

  pool.release(mask);
  pool.release(warped);
};
