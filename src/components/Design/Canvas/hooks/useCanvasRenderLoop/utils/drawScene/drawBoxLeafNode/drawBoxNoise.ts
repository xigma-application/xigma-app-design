// types
import { BlendMode } from 'types/design/enums';
import { TDrawSceneContext } from '../types';
import { TEffect, TFrameNode, TRectangleNode, TSectionNode } from 'types/design/types';

// utils
import { drawEffectBlended } from './drawEffectBlended';
import { drawNoiseShape } from './drawNoiseShape';

export const drawBoxNoise = (
  context: TDrawSceneContext,
  node: TFrameNode | TRectangleNode | TSectionNode,
  effect: TEffect,
  opacity: number,
  blendMode?: BlendMode,
): void => drawEffectBlended(context, blendMode, () => drawNoiseShape(context, node, effect, opacity));
