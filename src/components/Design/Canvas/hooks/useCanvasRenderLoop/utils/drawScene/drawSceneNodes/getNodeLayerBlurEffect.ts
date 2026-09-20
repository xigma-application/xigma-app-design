// types
import { EffectType } from 'types/design/enums';
import { TEffect, TSceneNode } from 'types/design/types';

export const getNodeLayerBlurEffect = (node: TSceneNode): TEffect | undefined => {
  if ('effects' in node && node.effects) {
    return node.effects.find((effect) => effect.type === EffectType.layerBlur && effect.visible !== false);
  }
};
