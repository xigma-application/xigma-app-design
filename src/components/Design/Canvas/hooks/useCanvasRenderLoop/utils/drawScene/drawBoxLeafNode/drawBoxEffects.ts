// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from '../types';
import { TFrameNode, TRectangleNode, TSectionNode } from 'types/design/types';

// utils
import { getBoxEffectDrawer, TDrawableBoxEffectType } from './getBoxEffectDrawer';
import { getEffectBlendModePreview } from 'utils/canvas/blendMode/getEffectBlendModePreview';

export const drawBoxEffects = (
  context: TDrawSceneContext,
  node: TFrameNode | TRectangleNode | TSectionNode,
  opacity: number,
  refs: TCanvasRefs,
  effectType: TDrawableBoxEffectType,
): void => {
  if (node.width > 0 && node.height > 0 && node.effects) {
    const draw = getBoxEffectDrawer(effectType);

    node.effects.forEach((effect, index) => {
      if (effect.visible !== false && effect.type === effectType) {
        draw(context, node, effect, opacity, getEffectBlendModePreview(refs, node.id, index) ?? effect.blendMode);
      }
    });
  }
};
