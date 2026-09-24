// types
import { BlendMode, EffectType } from 'types/design/enums';
import { TBooleanShape } from './types';
import { TDrawSceneContext } from '../types';
import { TEffect } from 'types/design/types';

// utils
import { drawEffectTextureBlended } from '../drawBoxLeafNode/drawEffectTextureBlended';
import { getBooleanEffectTextureKey } from './getBooleanEffectTextureKey';
import { getBoxEffectMargin } from '../drawBoxLeafNode/getBoxEffectMargin';
import { getBoxEffectTargetSize } from '../drawBoxLeafNode/getBoxEffectTargetSize';
import { getCachedEffectTexture } from 'utils/canvas/effectTextureCache/getCachedEffectTexture';
import { renderBooleanInnerShadowTexture } from './renderBooleanInnerShadowTexture';

export const drawBooleanInnerShadow = (
  context: TDrawSceneContext,
  shape: TBooleanShape,
  effect: TEffect,
  opacity: number,
  blendMode?: BlendMode,
): void => {
  const margin = getBoxEffectMargin(effect.blur);
  const size = getBoxEffectTargetSize(shape.bounds, margin);
  const texture = getCachedEffectTexture(context.gl, getBooleanEffectTextureKey(EffectType.innerShadow, shape, effect), () =>
    renderBooleanInnerShadowTexture(context, shape, effect),
  );

  drawEffectTextureBlended(
    context,
    texture,
    { height: size.height, width: size.width, x: shape.bounds.x - margin, y: shape.bounds.y - margin },
    0,
    (effect.opacity / 100) * opacity,
    blendMode,
  );
};
