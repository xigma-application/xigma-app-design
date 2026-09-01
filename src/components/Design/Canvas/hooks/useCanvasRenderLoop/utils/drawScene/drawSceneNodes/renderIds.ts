// utils
import { renderNode } from './renderNode';

// types
import { TMaskRenderer } from './types';
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';

export const renderIds = (renderer: TMaskRenderer, ids: string[], target: TRenderTarget | null): void => {
  ids.forEach((id) => renderNode(renderer, id, target));
};
