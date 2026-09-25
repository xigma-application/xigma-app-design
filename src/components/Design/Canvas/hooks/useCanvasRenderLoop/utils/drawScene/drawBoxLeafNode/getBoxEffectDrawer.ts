// types
import { BlendMode, EffectType } from 'types/design/enums';
import { TDrawSceneContext } from '../types';
import { TEffect, TFrameNode, TRectangleNode, TSectionNode } from 'types/design/types';

// utils
import { drawBoxDropShadow } from './drawBoxDropShadow';
import { drawBoxInnerShadow } from './drawBoxInnerShadow';
import { drawBoxNoise } from './drawBoxNoise';

export type TBoxEffectDrawer = (
  context: TDrawSceneContext,
  node: TFrameNode | TRectangleNode | TSectionNode,
  effect: TEffect,
  opacity: number,
  blendMode?: BlendMode,
) => void;

export type TDrawableBoxEffectType = EffectType.dropShadow | EffectType.innerShadow | EffectType.noise;

export const getBoxEffectDrawer = (type: TDrawableBoxEffectType): TBoxEffectDrawer => {
  switch (type) {
    case EffectType.dropShadow:
      return drawBoxDropShadow;
    case EffectType.noise:
      return drawBoxNoise;
    default:
      return drawBoxInnerShadow;
  }
};
