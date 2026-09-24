// types
import { EffectType } from 'types/design/enums';
import { TBooleanEffectDrawer } from './types';
import { TDrawableBoxEffectType } from '../drawBoxLeafNode/getBoxEffectDrawer';

// utils
import { drawBooleanDropShadow } from './drawBooleanDropShadow';
import { drawBooleanInnerShadow } from './drawBooleanInnerShadow';
import { drawBooleanNoise } from './drawBooleanNoise';

export const getBooleanEffectDrawer = (type: TDrawableBoxEffectType): TBooleanEffectDrawer => {
  switch (type) {
    case EffectType.dropShadow:
      return drawBooleanDropShadow;
    case EffectType.noise:
      return drawBooleanNoise;
    default:
      return drawBooleanInnerShadow;
  }
};
