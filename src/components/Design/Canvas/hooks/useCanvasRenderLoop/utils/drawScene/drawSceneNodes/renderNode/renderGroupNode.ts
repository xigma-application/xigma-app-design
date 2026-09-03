// types
import { TGroupNode } from 'types/design/types';
import { TMaskRenderer } from '../types';
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';

// utils
import { renderIds } from '../renderIds';
import { renderMaskGroup } from '../renderMaskGroup';

export const renderGroupNode = (renderer: TMaskRenderer, node: TGroupNode, target: TRenderTarget | null): void => {
  const maskIndex = node.childIds.findIndex((childId) => renderer.sceneNodeById.get(childId)?.isMask);

  if (maskIndex === -1) {
    renderIds(renderer, node.childIds, target);
  } else {
    renderMaskGroup(renderer, node, maskIndex, target);
  }
};
