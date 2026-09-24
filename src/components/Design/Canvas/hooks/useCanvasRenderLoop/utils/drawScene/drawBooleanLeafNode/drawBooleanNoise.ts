// types
import { BlendMode } from 'types/design/enums';
import { TBooleanShape } from './types';
import { TDrawSceneContext } from '../types';
import { TEffect } from 'types/design/types';

// utils
import { drawBooleanNoiseMask } from './drawBooleanNoiseMask';
import { drawEffectBlended } from '../drawBoxLeafNode/drawEffectBlended';
import { drawNoisePolygon } from '../drawBoxLeafNode/drawNoisePolygon';
import { getBooleanNoisePoints } from './getBooleanNoisePoints';

export const drawBooleanNoise = (
  context: TDrawSceneContext,
  shape: TBooleanShape,
  effect: TEffect,
  opacity: number,
  blendMode?: BlendMode,
): void =>
  drawEffectBlended(context, blendMode, () => {
    const { bounds } = shape;

    drawNoisePolygon(
      context,
      effect,
      opacity,
      getBooleanNoisePoints(bounds),
      { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 },
      0,
      drawBooleanNoiseMask(context, shape),
    );
  });
