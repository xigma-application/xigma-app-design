// types
import { TSectionNode } from 'types/design/types';
import { TMaskRenderer } from '../types';
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';

// utils
import { renderIds } from '../renderIds';

export const renderSectionNode = (renderer: TMaskRenderer, node: TSectionNode, target: TRenderTarget | null): void => {
  renderer.paintLeaf(node);
  renderIds(renderer, node.childIds, target);
};
