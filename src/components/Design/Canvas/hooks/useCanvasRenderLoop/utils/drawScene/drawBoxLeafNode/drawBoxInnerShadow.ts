// types
import { BlendMode, EffectType } from 'types/design/enums';
import { TDrawSceneContext } from '../types';
import { TEffect, TFrameNode, TRectangleNode, TSectionNode } from 'types/design/types';

// utils
import { drawEffectTextureBlended } from './drawEffectTextureBlended';
import { getBoxEffectMargin } from './getBoxEffectMargin';
import { getBoxEffectTargetSize } from './getBoxEffectTargetSize';
import { getBoxEffectTextureKey } from './getBoxEffectTextureKey';
import { getCachedEffectTexture } from 'utils/canvas/effectTextureCache/getCachedEffectTexture';
import { renderInnerShadowTexture } from './renderInnerShadowTexture';

export const drawBoxInnerShadow = (
  context: TDrawSceneContext,
  node: TFrameNode | TRectangleNode | TSectionNode,
  effect: TEffect,
  opacity: number,
  blendMode?: BlendMode,
): void => {
  const margin = getBoxEffectMargin(effect.blur);
  const size = getBoxEffectTargetSize(node, margin);
  const texture = getCachedEffectTexture(context.gl, getBoxEffectTextureKey(EffectType.innerShadow, node, effect), () =>
    renderInnerShadowTexture(context, node, effect),
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
