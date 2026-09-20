// types
import { EffectType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from '../types';
import { TFrameNode, TRectangleNode } from 'types/design/types';

// utils
import { drawBoxInnerShadow } from './drawBoxInnerShadow';
import { getEffectBlendModePreview } from 'utils/canvas/blendMode/getEffectBlendModePreview';

export const drawBoxEffects = (context: TDrawSceneContext, node: TFrameNode | TRectangleNode, opacity: number, refs: TCanvasRefs): void => {
  if (node.width > 0 && node.height > 0 && node.effects) {
    node.effects.forEach((effect, index) => {
      if (effect.visible !== false && effect.type === EffectType.innerShadow) {
        drawBoxInnerShadow(context, node, effect, opacity, getEffectBlendModePreview(refs, node.id, index) ?? effect.blendMode);
      }
    });
  }
};
