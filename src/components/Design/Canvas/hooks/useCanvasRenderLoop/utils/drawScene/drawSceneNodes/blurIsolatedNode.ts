// types
import { TMaskRenderer } from './types';
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';
import { TSceneNode } from 'types/design/types';

// utils
import { blurIsolatedTarget } from './blurIsolatedTarget';
import { getLayerBlurRadius } from './getLayerBlurRadius';
import { getNodeLayerBlur } from './getNodeLayerBlur';

export const blurIsolatedNode = (renderer: TMaskRenderer, node: TSceneNode, contentTarget: TRenderTarget): void => {
  const layerBlur = getNodeLayerBlur(node);

  if (layerBlur > 0) {
    blurIsolatedTarget(renderer, contentTarget, getLayerBlurRadius(renderer, layerBlur));
  }
};
