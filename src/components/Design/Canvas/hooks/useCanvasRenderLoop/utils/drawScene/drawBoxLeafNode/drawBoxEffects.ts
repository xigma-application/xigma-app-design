// types
import { EffectType } from 'types/design/enums';
import { TDrawSceneContext } from '../types';
import { TFrameNode, TRectangleNode } from 'types/design/types';

// utils
import { drawBoxInnerShadow } from './drawBoxInnerShadow';

export const drawBoxEffects = (context: TDrawSceneContext, node: TFrameNode | TRectangleNode, opacity: number): void => {
  if (node.width > 0 && node.height > 0 && node.effects) {
    node.effects
      .filter((effect) => effect.visible !== false && effect.type === EffectType.innerShadow)
      .forEach((effect) => drawBoxInnerShadow(context, node, effect, opacity));
  }
};
