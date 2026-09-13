// types
import { TMaskRenderer } from '../types';
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';

// utils
import { dispatchNodeType } from './dispatchNodeType';
import { hasRealBlendMode } from '../hasRealBlendMode';
import { renderIsolatedBlendNode } from './renderIsolatedBlendNode';

export const renderNode = (renderer: TMaskRenderer, id: string, target: TRenderTarget | null): void => {
  const node = renderer.sceneNodeById.get(id);

  if (node) {
    if (hasRealBlendMode(node, renderer.refs)) {
      renderIsolatedBlendNode(renderer, node, target);
    } else {
      dispatchNodeType(renderer, node, target);
    }
  }
};
