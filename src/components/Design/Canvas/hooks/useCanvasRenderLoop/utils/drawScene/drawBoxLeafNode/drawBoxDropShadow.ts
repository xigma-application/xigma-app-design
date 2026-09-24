// types
import { BlendMode, EffectType } from 'types/design/enums';
import { TDrawSceneContext } from '../types';
import { TEffect, TFrameNode, TRectangleNode } from 'types/design/types';

// utils
import { drawEffectTextureBlended } from './drawEffectTextureBlended';
import { getBoxEffectTargetSize } from './getBoxEffectTargetSize';
import { getBoxEffectTextureKey } from './getBoxEffectTextureKey';
import { getCachedEffectTexture } from 'utils/canvas/effectTextureCache/getCachedEffectTexture';
import { getDropShadowMargin } from './getDropShadowMargin';
import { renderDropShadowTexture } from './renderDropShadowTexture';

export const drawBoxDropShadow = (
  context: TDrawSceneContext,
  node: TFrameNode | TRectangleNode,
  effect: TEffect,
  opacity: number,
  blendMode?: BlendMode,
): void => {
  const margin = getDropShadowMargin(effect);
  const size = getBoxEffectTargetSize(node, margin);
  const texture = getCachedEffectTexture(context.gl, getBoxEffectTextureKey(EffectType.dropShadow, node, effect), () =>
    renderDropShadowTexture(context, node, effect),
  );

  drawEffectTextureBlended(
    context,
    texture,
    { height: size.height, width: size.width, x: node.x - margin, y: node.y - margin },
    node.rotation,
    (effect.opacity / 100) * opacity,
    blendMode,
  );
};
