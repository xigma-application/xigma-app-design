// types
import { TMaskRenderer } from '../types';
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';

// utils
import { dispatchNodeType } from './dispatchNodeType';
import { getNodeLayerBlur } from '../getNodeLayerBlur';
import { hasRealBlendMode } from '../hasRealBlendMode';
import { renderIsolatedBlendNode } from './renderIsolatedBlendNode';

export const renderNode = (renderer: TMaskRenderer, id: string, target: TRenderTarget | null): void => {
  const node = renderer.sceneNodeById.get(id);

  if (node) {
    if (hasRealBlendMode(node, renderer.refs) || getNodeLayerBlur(node) > 0) {
      renderIsolatedBlendNode(renderer, node, target);
    } else {
      dispatchNodeType(renderer, node, target);
    }
  }
};
