// types
import { TMaskRenderer } from './types';

// utils
import { renderNode } from './renderNode/renderNode';

export const renderHoistedIds = (renderer: TMaskRenderer): void => {
  renderer.hoistedIds.forEach((id) => renderNode(renderer, id, null));
};
