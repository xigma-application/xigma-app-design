// types
import { TSceneNode } from 'types/design/types';

// utils
import { getNodeLayerBlurEffect } from './getNodeLayerBlurEffect';
import { getProgressiveBlur } from 'utils/design/effects/getProgressiveBlur';
import { isProgressiveLayerBlur } from 'utils/design/effects/isProgressiveLayerBlur';

export const getNodeLayerBlur = (node: TSceneNode): number => {
  const effect = getNodeLayerBlurEffect(node);

  if (effect && isProgressiveLayerBlur(effect)) {
    const { endBlur, startBlur } = getProgressiveBlur(effect);
    return Math.max(startBlur, endBlur);
  }

  return effect?.blur ?? 0;
};
