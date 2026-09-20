// types
import { BlendMode } from 'types/design/enums';
import { TDrawSceneContext } from '../types';

// utils
import { drawEffectIsolated } from './drawEffectIsolated';

export const drawEffectBlended = (context: TDrawSceneContext, blendMode: BlendMode | undefined, paint: () => void): void => {
  if (blendMode && blendMode !== BlendMode.normal && blendMode !== BlendMode.passThrough) {
    drawEffectIsolated(context, blendMode, paint);
  } else {
    paint();
  }
};
