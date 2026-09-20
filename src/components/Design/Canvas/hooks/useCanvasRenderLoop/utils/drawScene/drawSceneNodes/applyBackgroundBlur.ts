// types
import { EffectType } from 'types/design/enums';
import { TMaskRenderer } from './types';
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';
import { TSceneNode } from 'types/design/types';

// utils
import { bindTarget } from './bindTarget';
import { blurIsolatedTarget } from './blurIsolatedTarget';
import { captureBackdropTexture } from './captureBackdropTexture';
import { compositeMask } from '../compositeMask';
import { getNodeBlurParams } from './getNodeBlurParams';
import { paintBackgroundBlurShape } from './paintBackgroundBlurShape';
import { renderIntoTarget } from './renderIntoTarget';

export const applyBackgroundBlur = (renderer: TMaskRenderer, node: TSceneNode, target: TRenderTarget | null): void => {
  const params = getNodeBlurParams(renderer, node, EffectType.backgroundBlur);

  if (params && params.radius > 0) {
    const { context, pool } = renderer;

    bindTarget(renderer, target);

    const backdrop = captureBackdropTexture(renderer);
    const mask = pool.acquire();

    blurIsolatedTarget(renderer, backdrop, params.radius, params.progressive);
    renderIntoTarget(renderer, mask, () => paintBackgroundBlurShape(renderer, node));
    bindTarget(renderer, target);
    compositeMask(context, backdrop.texture, mask.texture);

    pool.release(mask);
    pool.release(backdrop);
  }
};
