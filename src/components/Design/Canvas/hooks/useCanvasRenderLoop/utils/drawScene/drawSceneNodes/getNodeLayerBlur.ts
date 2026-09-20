// types
import { EffectType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

export const getNodeLayerBlur = (node: TSceneNode): number => {
  if ('effects' in node && node.effects) {
    return node.effects.find((effect) => effect.type === EffectType.layerBlur && effect.visible !== false)?.blur ?? 0;
  }

  return 0;
};
