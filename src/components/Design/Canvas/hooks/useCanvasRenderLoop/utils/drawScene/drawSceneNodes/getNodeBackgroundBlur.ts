// types
import { EffectType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getEffectBlurAmount } from './getEffectBlurAmount';
import { getNodeEffectOfType } from './getNodeEffectOfType';

export const getNodeBackgroundBlur = (node: TSceneNode): number =>
  getEffectBlurAmount(getNodeEffectOfType(node, EffectType.backgroundBlur));
