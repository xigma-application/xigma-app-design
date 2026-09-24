// types
import { BlendMode, EffectType } from 'types/design/enums';
import { TBooleanShape } from './types';
import { TDrawSceneContext } from '../types';
import { TEffect } from 'types/design/types';

// utils
import { drawEffectTextureBlended } from '../drawBoxLeafNode/drawEffectTextureBlended';
import { getBooleanEffectTextureKey } from './getBooleanEffectTextureKey';
import { getBoxEffectTargetSize } from '../drawBoxLeafNode/getBoxEffectTargetSize';
import { getCachedEffectTexture } from 'utils/canvas/effectTextureCache/getCachedEffectTexture';
import { getDropShadowMargin } from '../drawBoxLeafNode/getDropShadowMargin';
import { renderBooleanDropShadowTexture } from './renderBooleanDropShadowTexture';

export const drawBooleanDropShadow = (
  context: TDrawSceneContext,
  shape: TBooleanShape,
  effect: TEffect,
  opacity: number,
  blendMode?: BlendMode,
): void => {
  const margin = getDropShadowMargin(effect);
  const size = getBoxEffectTargetSize(shape.bounds, margin);
  const texture = getCachedEffectTexture(context.gl, getBooleanEffectTextureKey(EffectType.dropShadow, shape, effect), () =>
    renderBooleanDropShadowTexture(context, shape, effect),
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
