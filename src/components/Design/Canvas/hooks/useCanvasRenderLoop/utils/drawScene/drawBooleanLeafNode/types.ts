// types
import { BlendMode } from 'types/design/enums';
import { TDraftRect, TPoint } from 'types/canvas';
import { TDrawSceneContext } from '../types';
import { TEffect } from 'types/design/types';

export type TBooleanShape = {
  bounds: TDraftRect;
  key: number;
  polygons: TPoint[][];
};

export type TBooleanEffectDrawer = (
  context: TDrawSceneContext,
  shape: TBooleanShape,
  effect: TEffect,
  opacity: number,
  blendMode?: BlendMode,
) => void;
