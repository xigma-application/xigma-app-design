// types
import { TMaskNode } from 'types/design/types';
import { TMaskRenderer } from '../types';
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';

// utils
import { bindTarget } from '../bindTarget';
import { compositeMask } from '../../compositeMask';
import { renderIds } from '../renderIds';
import { renderIntoTarget } from '../renderIntoTarget';
import { renderNode } from './renderNode';

export const renderMaskNode = (renderer: TMaskRenderer, node: TMaskNode, target: TRenderTarget | null): void => {
  const { context, pool } = renderer;
  const maskIndex = node.childIds.length - 1;
  const contentIds = node.childIds.slice(0, maskIndex);

  if (contentIds.length > 0) {
    const contentTarget = pool.acquire();
    const maskTarget = pool.acquire();

    renderIntoTarget(renderer, contentTarget, () => renderIds(renderer, contentIds, contentTarget));
    renderIntoTarget(renderer, maskTarget, () => renderNode(renderer, node.childIds[maskIndex], maskTarget));
    bindTarget(renderer, target);
    compositeMask(context, contentTarget.texture, maskTarget.texture);

    pool.release(contentTarget);
    pool.release(maskTarget);
  }
};
