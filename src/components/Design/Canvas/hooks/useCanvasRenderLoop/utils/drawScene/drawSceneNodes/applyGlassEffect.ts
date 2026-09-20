// store
import { selectNodes } from 'store/design/selectors';
import { store } from 'store';

// types
import { TMaskRenderer } from './types';
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';
import { TSceneNode } from 'types/design/types';

// utils
import { bindTarget } from './bindTarget';
import { blitGlassCacheEntry } from './blitGlassCacheEntry';
import { compositeMask } from '../compositeMask';
import { EFFECT_BLUR_MAX_PX } from '../drawBoxLeafNode/constants';
import { getEffectGlass } from 'utils/design/effects/getEffectGlass';
import { getGlassCacheHit } from './getGlassCacheHit';
import { getIsolatedScissorRect } from './getIsolatedScissorRect';
import { getLayerBlurRadius } from './getLayerBlurRadius';
import { getNodeGlass } from './getNodeGlass';
import { paintBackgroundBlurShape } from './paintBackgroundBlurShape';
import { renderFreshGlassWarp } from './renderFreshGlassWarp';
import { renderIntoTarget } from './renderIntoTarget';
import { setScissorRect } from './setScissorRect';
import { storeGlassCacheEntry } from './storeGlassCacheEntry';

export const applyGlassEffect = (renderer: TMaskRenderer, node: TSceneNode, target: TRenderTarget | null): void => {
  const effect = getNodeGlass(node);

  if (effect) {
    const rect = getIsolatedScissorRect(renderer, node);

    if (!rect?.offscreen) {
      const { context, gl, pool } = renderer;
      const frostRadius = getLayerBlurRadius(renderer, (getEffectGlass(effect).frost / 100) * EFFECT_BLUR_MAX_PX);
      const nodesState = selectNodes(store.getState());

      bindTarget(renderer, target);

      const warped = pool.acquire();
      const mask = pool.acquire();
      const cacheHit = rect ? getGlassCacheHit(gl, node.id, nodesState, rect) : undefined;

      if (cacheHit) {
        blitGlassCacheEntry(gl, cacheHit, warped, rect);
      } else {
        renderFreshGlassWarp(renderer, node, effect, rect, frostRadius, warped);

        if (rect) {
          storeGlassCacheEntry(gl, node.id, nodesState, warped, rect);
        }
      }

      renderIntoTarget(renderer, mask, () => paintBackgroundBlurShape(renderer, node));
      bindTarget(renderer, target);
      setScissorRect(gl, rect);
      compositeMask(context, warped.texture, mask.texture);
      setScissorRect(gl, null);

      pool.release(mask);
      pool.release(warped);
    }
  }
};
