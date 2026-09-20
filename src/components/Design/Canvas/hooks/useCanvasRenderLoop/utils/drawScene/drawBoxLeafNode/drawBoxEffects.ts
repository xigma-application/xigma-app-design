// types
import { EffectType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from '../types';
import { TFrameNode, TRectangleNode } from 'types/design/types';

// utils
import { drawBoxDropShadow } from './drawBoxDropShadow';
import { drawBoxInnerShadow } from './drawBoxInnerShadow';
import { getEffectBlendModePreview } from 'utils/canvas/blendMode/getEffectBlendModePreview';

export const drawBoxEffects = (
  context: TDrawSceneContext,
  node: TFrameNode | TRectangleNode,
  opacity: number,
  refs: TCanvasRefs,
  effectType: EffectType.dropShadow | EffectType.innerShadow,
): void => {
  if (node.width > 0 && node.height > 0 && node.effects) {
    const draw = effectType === EffectType.dropShadow ? drawBoxDropShadow : drawBoxInnerShadow;

    node.effects.forEach((effect, index) => {
      if (effect.visible !== false && effect.type === effectType) {
        draw(context, node, effect, opacity, getEffectBlendModePreview(refs, node.id, index) ?? effect.blendMode);
      }
    });
  }
};
