// types
import { EffectType } from 'types/design/enums';
import { TMaskRenderer } from './types';
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';
import { TSceneNode } from 'types/design/types';

// utils
import { blurIsolatedTarget } from './blurIsolatedTarget';
import { getNodeBlurParams } from './getNodeBlurParams';

export const blurIsolatedNode = (renderer: TMaskRenderer, node: TSceneNode, contentTarget: TRenderTarget): void => {
  const params = getNodeBlurParams(renderer, node, EffectType.layerBlur);

  if (params && params.radius > 0) {
    blurIsolatedTarget(renderer, contentTarget, params.radius, params.progressive);
  }
};
