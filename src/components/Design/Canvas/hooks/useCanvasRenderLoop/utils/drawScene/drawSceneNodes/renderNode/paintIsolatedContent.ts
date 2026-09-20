// types
import { TMaskRenderer, TScissorRect } from '../types';
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';
import { TSceneNode } from 'types/design/types';

// utils
import { blitBlurCacheEntry } from '../blitBlurCacheEntry';
import { blurIsolatedNode } from '../blurIsolatedNode';
import { dispatchNodeType } from './dispatchNodeType';
import { getBlurCacheEntry } from '../getBlurCacheEntry';
import { getBlurCacheKey } from '../getBlurCacheKey';
import { isBlurCacheable } from '../isBlurCacheable';
import { storeBlurCacheEntry } from '../storeBlurCacheEntry';

export const paintIsolatedContent = (
  renderer: TMaskRenderer,
  node: TSceneNode,
  contentTarget: TRenderTarget,
  rect: TScissorRect | null,
): void => {
  const { gl } = renderer;
  const key = rect && isBlurCacheable(node) ? getBlurCacheKey(renderer, node) : null;
  const entry = key ? getBlurCacheEntry(gl, node.id, key) : null;

  if (entry && rect) {
    blitBlurCacheEntry(gl, entry, contentTarget, rect);
  } else {
    dispatchNodeType(renderer, node, contentTarget);
    blurIsolatedNode(renderer, node, contentTarget, rect);

    if (key && rect && !rect.clipped) {
      storeBlurCacheEntry(gl, node.id, key, contentTarget, rect);
    }
  }
};
