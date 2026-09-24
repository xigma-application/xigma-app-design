// store
import { selectNodes } from 'store/design/selectors';
import { store } from 'store';

// types
import { EffectType } from 'types/design/enums';
import { TMaskRenderer, TScissorRect } from './types';
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';
import { TSceneNode } from 'types/design/types';

// utils
import { bindTarget } from './bindTarget';
import { blurIsolatedTarget } from './blurIsolatedTarget';
import { captureBackdropTexture } from './captureBackdropTexture';
import { compositeGlassCacheEntry } from './compositeGlassCacheEntry';
import { compositeMask } from '../compositeMask';
import { getBackgroundBlurCacheKey } from './getBackgroundBlurCacheKey';
import { getBackgroundBlurRect } from './getBackgroundBlurRect';
import { getGlassCacheHit } from './getGlassCacheHit';
import { getNodeBlurParams } from './getNodeBlurParams';
import { getStretchableGlassCacheEntry } from './getStretchableGlassCacheEntry';
import { isBlurZoomChanging } from './isBlurZoomChanging';
import { isGlassRectStable } from './isGlassRectStable';
import { paintBackgroundBlurShape } from './paintBackgroundBlurShape';
import { refreshGlassCacheEntry } from './refreshGlassCacheEntry';
import { renderIntoTarget } from './renderIntoTarget';
import { setScissorRect } from './setScissorRect';
import { storeGlassCacheEntry } from './storeGlassCacheEntry';

const storeStableBackgroundBlur = (
  gl: WebGL2RenderingContext,
  cacheKey: string,
  nodesState: unknown,
  backdrop: TRenderTarget,
  mask: TRenderTarget,
  rect: TScissorRect,
): void => {
  if (isGlassRectStable(gl, cacheKey, rect)) {
    storeGlassCacheEntry(gl, cacheKey, nodesState, backdrop, mask, rect);
  }
};

export const applyBackgroundBlur = (renderer: TMaskRenderer, node: TSceneNode, target: TRenderTarget | null): void => {
  const params = getNodeBlurParams(renderer, node, EffectType.backgroundBlur);

  if (params && params.radius > 0) {
    const { context, gl, pool } = renderer;
    const rect = getBackgroundBlurRect(renderer, node, params.radius);

    if (!rect.offscreen) {
      const nodesState = selectNodes(store.getState());
      const cacheKey = getBackgroundBlurCacheKey(node.id);

      refreshGlassCacheEntry(renderer, node.id, nodesState, rect, cacheKey);

      const isZoomChanging = isBlurZoomChanging(gl, context.viewport.zoom, performance.now());
      const cacheHit =
        getGlassCacheHit(gl, cacheKey, nodesState, rect) ??
        (isZoomChanging ? getStretchableGlassCacheEntry(gl, cacheKey, nodesState, rect) : undefined);

      bindTarget(renderer, target);

      if (cacheHit) {
        compositeGlassCacheEntry(renderer, cacheHit, rect);
      } else {
        const backdrop = captureBackdropTexture(renderer, rect);
        const mask = pool.acquire();

        blurIsolatedTarget(renderer, backdrop, params.radius, params.progressive, rect);
        renderIntoTarget(renderer, mask, () => paintBackgroundBlurShape(renderer, node), rect);
        storeStableBackgroundBlur(gl, cacheKey, nodesState, backdrop, mask, rect);
        bindTarget(renderer, target);
        setScissorRect(gl, rect);
        compositeMask(context, backdrop.texture, mask.texture);
        setScissorRect(gl, null);

        pool.release(mask);
        pool.release(backdrop);
      }
    }
  }
};
