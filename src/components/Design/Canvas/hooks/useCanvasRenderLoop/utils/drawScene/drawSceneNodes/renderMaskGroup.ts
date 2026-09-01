// utils
import { bindTarget } from './bindTarget';
import { compositeMask } from '../compositeMask';
import { renderIds } from './renderIds';
import { renderIntoTarget } from './renderIntoTarget';
import { renderNode } from './renderNode';

// types
import { TGroupNode } from 'types/design/types';
import { TMaskRenderer } from './types';
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';

export const renderMaskGroup = (renderer: TMaskRenderer, group: TGroupNode, maskIndex: number, target: TRenderTarget | null): void => {
  const { context, pool } = renderer;
  renderIds(renderer, group.childIds.slice(0, maskIndex), target);
  const contentIds = group.childIds.slice(maskIndex + 1);

  if (contentIds.length > 0) {
    const contentTarget = pool.acquire();
    const maskTarget = pool.acquire();

    renderIntoTarget(renderer, contentTarget, () => renderIds(renderer, contentIds, contentTarget));
    renderIntoTarget(renderer, maskTarget, () => renderNode(renderer, group.childIds[maskIndex], maskTarget));
    bindTarget(renderer, target);
    compositeMask(context, contentTarget.texture, maskTarget.texture);

    pool.release(contentTarget);
    pool.release(maskTarget);
  }
};
