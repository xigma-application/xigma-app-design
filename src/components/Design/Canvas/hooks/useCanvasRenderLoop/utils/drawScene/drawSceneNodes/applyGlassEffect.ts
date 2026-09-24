// store
import { selectNodes } from 'store/design/selectors';
import { store } from 'store';

// types
import { TEffect, TSceneNode } from 'types/design/types';
import { TGlassCacheEntry, TMaskRenderer, TScissorRect } from './types';
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';

// utils
import { bindTarget } from './bindTarget';
import { canRenderGlassDirectly } from './canRenderGlassDirectly';
import { compositeGlassCacheEntry } from './compositeGlassCacheEntry';
import { getGlassCacheHit } from './getGlassCacheHit';
import { getIsolatedScissorRect } from './getIsolatedScissorRect';
import { getNodeGlass } from './getNodeGlass';
import { markGlassBackdropDirty } from './markGlassBackdropDirty';
import { refreshGlassCacheEntry } from './refreshGlassCacheEntry';
import { renderDirectGlass } from './renderDirectGlass';
import { renderFreshGlass } from './renderFreshGlass';

const renderGlass = (
  renderer: TMaskRenderer,
  node: TSceneNode,
  effect: TEffect,
  target: TRenderTarget | null,
  rect: TScissorRect | null,
  cacheHit: TGlassCacheEntry | undefined,
  nodesState: unknown,
): void => {
  if (rect && cacheHit) {
    compositeGlassCacheEntry(renderer, cacheHit, rect);
    markGlassBackdropDirty(renderer, rect);
  } else if (rect && canRenderGlassDirectly(renderer, node, target, rect)) {
    renderDirectGlass(renderer, node, effect, rect);
  } else {
    renderFreshGlass(renderer, node, effect, target, rect, nodesState);
  }
};

const getGlassCacheEntry = (
  renderer: TMaskRenderer,
  nodeId: string,
  nodesState: unknown,
  rect: TScissorRect | null,
): TGlassCacheEntry | undefined => {
  if (rect) {
    refreshGlassCacheEntry(renderer, nodeId, nodesState, rect);

    return getGlassCacheHit(renderer.gl, nodeId, nodesState, rect);
  }
};

export const applyGlassEffect = (renderer: TMaskRenderer, node: TSceneNode, target: TRenderTarget | null): void => {
  const effect = getNodeGlass(node);

  if (effect) {
    const rect = getIsolatedScissorRect(renderer, node);

    if (!rect?.offscreen) {
      const nodesState = selectNodes(store.getState());
      const cacheHit = getGlassCacheEntry(renderer, node.id, nodesState, rect);

      bindTarget(renderer, target);
      renderGlass(renderer, node, effect, target, rect, cacheHit, nodesState);
    }
  }
};
