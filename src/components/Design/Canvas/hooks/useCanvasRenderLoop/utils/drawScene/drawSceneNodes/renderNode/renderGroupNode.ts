// types
import { TGroupNode } from 'types/design/types';
import { TMaskRenderer } from '../types';
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';

// utils
import { renderIds } from '../renderIds';

export const renderGroupNode = (renderer: TMaskRenderer, node: TGroupNode, target: TRenderTarget | null): void => {
  renderIds(renderer, node.childIds, target);
};
