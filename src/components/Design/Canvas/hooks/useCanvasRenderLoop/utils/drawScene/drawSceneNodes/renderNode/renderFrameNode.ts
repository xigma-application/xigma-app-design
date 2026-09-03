// types
import { TFrameNode } from 'types/design/types';
import { TMaskRenderer } from '../types';
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';

// utils
import { renderClippedFrame } from '../renderClippedFrame';
import { renderIds } from '../renderIds';

export const renderFrameNode = (renderer: TMaskRenderer, node: TFrameNode, target: TRenderTarget | null): void => {
  renderer.paintLeaf(node);

  if (node.clipContent && node.childIds.length > 0) {
    renderClippedFrame(renderer, node, target);
  } else {
    renderIds(renderer, node.childIds, target);
  }
};
