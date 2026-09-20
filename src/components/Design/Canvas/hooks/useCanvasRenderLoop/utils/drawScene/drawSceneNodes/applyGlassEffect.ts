// store
import { selectNodes } from 'store/design/selectors';
import { store } from 'store';

// types
import { TMaskRenderer } from './types';
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';
import { TSceneNode } from 'types/design/types';

// utils
import { bindTarget } from './bindTarget';
import { canRenderGlassDirectly } from './canRenderGlassDirectly';
import { compositeGlassCacheEntry } from './compositeGlassCacheEntry';
import { getGlassCacheHit } from './getGlassCacheHit';
import { getIsolatedScissorRect } from './getIsolatedScissorRect';
import { getNodeGlass } from './getNodeGlass';
import { markGlassBackdropDirty } from './markGlassBackdropDirty';
import { renderDirectGlass } from './renderDirectGlass';
import { renderFreshGlass } from './renderFreshGlass';

export const applyGlassEffect = (renderer: TMaskRenderer, node: TSceneNode, target: TRenderTarget | null): void => {
  const effect = getNodeGlass(node);

  if (effect) {
    const rect = getIsolatedScissorRect(renderer, node);

    if (!rect?.offscreen) {
      const { gl } = renderer;
      const nodesState = selectNodes(store.getState());
      const cacheHit = rect ? getGlassCacheHit(gl, node.id, nodesState, rect) : undefined;

      bindTarget(renderer, target);
      if (rect && cacheHit) {
        compositeGlassCacheEntry(renderer, cacheHit, rect);
        markGlassBackdropDirty(renderer, rect);
      } else if (rect && canRenderGlassDirectly(renderer, node, target, rect)) {
        renderDirectGlass(renderer, node, effect, rect);
      } else {
        renderFreshGlass(renderer, node, effect, target, rect, nodesState);
      }
    }
  }
};
