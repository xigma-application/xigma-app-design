// types
import { TMaskRenderer } from './types';
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';
import { TSceneNode } from 'types/design/types';

// utils
import { blurIsolatedTarget } from './blurIsolatedTarget';
import { getNodeLayerBlurParams } from './getNodeLayerBlurParams';

export const blurIsolatedNode = (renderer: TMaskRenderer, node: TSceneNode, contentTarget: TRenderTarget): void => {
  const params = getNodeLayerBlurParams(renderer, node);

  if (params && params.radius > 0) {
    blurIsolatedTarget(renderer, contentTarget, params.radius, params.progressive);
  }
};
