// types
import { TFrameNode } from 'types/design/types';
import { TMaskRenderer } from '../types';
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';

// utils
import { bindTarget } from '../bindTarget';
import { getFrameChildIdsInPaintOrder } from 'store/design/utils/getFrameChildIdsInPaintOrder';
import { renderClippedFrame } from '../renderClippedFrame';
import { renderIds } from '../renderIds';

export const renderFrameNode = (renderer: TMaskRenderer, node: TFrameNode, target: TRenderTarget | null): void => {
  renderer.paintLeaf(node, 'fill');

  if (node.clipContent && node.childIds.length > 0) {
    renderClippedFrame(renderer, node, target);
  } else {
    renderIds(renderer, getFrameChildIdsInPaintOrder(node), target);
  }

  bindTarget(renderer, target);
  renderer.paintLeaf(node, 'stroke');
};
