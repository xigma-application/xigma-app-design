// types
import { TBlurCacheEntry, TMaskRenderer, TScissorRect } from '../types';
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';
import { TSceneNode } from 'types/design/types';

// utils
import { applyTextureEffect } from '../applyTextureEffect';
import { blitBlurCacheEntry } from '../blitBlurCacheEntry';
import { blurIsolatedNode } from '../blurIsolatedNode';
import { dispatchNodeType } from './dispatchNodeType';
import { getBlurCacheEntry } from '../getBlurCacheEntry';
import { getBlurCacheKey } from '../getBlurCacheKey';
import { isBlurCacheable } from '../isBlurCacheable';
import { isBlurZoomChanging } from '../isBlurZoomChanging';
import { storeBlurCacheEntry } from '../storeBlurCacheEntry';

const isSameRegion = (entry: TBlurCacheEntry, rect: TScissorRect): boolean =>
  entry.x === rect.x && entry.y === rect.y && entry.width === rect.width && entry.height === rect.height;

const canReuseEntry = (entry: TBlurCacheEntry, rect: TScissorRect, zoom: number, isZoomChanging: boolean): boolean => {
  if (entry.clipped) {
    return entry.zoom === zoom && isSameRegion(entry, rect);
  }

  return entry.zoom === zoom || isZoomChanging;
};

const paintAndCacheContent = (
  renderer: TMaskRenderer,
  node: TSceneNode,
  contentTarget: TRenderTarget,
  rect: TScissorRect | null,
  key: string | null,
): void => {
  dispatchNodeType(renderer, node, contentTarget);
  blurIsolatedNode(renderer, node, contentTarget, rect);

  if (key && rect) {
    storeBlurCacheEntry(renderer.gl, node.id, key, contentTarget, rect, renderer.context.viewport.zoom);
  }
};

export const paintIsolatedContent = (
  renderer: TMaskRenderer,
  node: TSceneNode,
  contentTarget: TRenderTarget,
  rect: TScissorRect | null,
): void => {
  const { context, gl } = renderer;
  const { zoom } = context.viewport;
  const isZoomChanging = isBlurZoomChanging(gl, zoom, performance.now());
  const key = rect && isBlurCacheable(node) ? getBlurCacheKey(renderer, node) : null;
  const entry = key ? getBlurCacheEntry(gl, node.id, key) : null;

  if (entry && rect && canReuseEntry(entry, rect, zoom, isZoomChanging)) {
    blitBlurCacheEntry(gl, entry, contentTarget, rect, zoom);
  } else {
    paintAndCacheContent(renderer, node, contentTarget, rect, key);
  }

  applyTextureEffect(renderer, node, contentTarget, rect);
};
