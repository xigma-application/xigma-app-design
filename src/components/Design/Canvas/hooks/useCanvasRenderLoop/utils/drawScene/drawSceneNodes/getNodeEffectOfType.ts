// types
import { EffectType } from 'types/design/enums';
import { TEffect, TSceneNode } from 'types/design/types';

export const getNodeEffectOfType = (node: TSceneNode, type: EffectType): TEffect | undefined => {
  if ('effects' in node && node.effects) {
    return node.effects.find((effect) => effect.type === type && effect.visible !== false);
  }
};
