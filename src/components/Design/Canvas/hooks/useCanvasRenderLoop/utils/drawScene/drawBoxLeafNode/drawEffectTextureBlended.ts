// types
import { BlendMode } from 'types/design/enums';
import { TDraftRect } from 'types/canvas';
import { TDrawSceneContext } from '../types';

// utils
import { drawEffectTexture } from './drawEffectTexture';
import { drawEffectTextureIsolated } from './drawEffectTextureIsolated';

export const drawEffectTextureBlended = (
  context: TDrawSceneContext,
  texture: WebGLTexture,
  rect: TDraftRect,
  rotation: number,
  opacity: number,
  blendMode?: BlendMode,
): void => {
  if (blendMode && blendMode !== BlendMode.normal && blendMode !== BlendMode.passThrough) {
    drawEffectTextureIsolated(context, texture, rect, rotation, opacity, blendMode);
  } else {
    drawEffectTexture(context, texture, rect, rotation, opacity);
  }
};
