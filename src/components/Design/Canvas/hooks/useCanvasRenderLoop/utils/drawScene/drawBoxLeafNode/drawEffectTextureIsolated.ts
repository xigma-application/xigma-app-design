// types
import { BlendMode } from 'types/design/enums';
import { TDraftRect } from 'types/canvas';
import { TDrawSceneContext } from '../types';

// utils
import { drawEffectIsolated } from './drawEffectIsolated';
import { drawEffectTexture } from './drawEffectTexture';

export const drawEffectTextureIsolated = (
  context: TDrawSceneContext,
  texture: WebGLTexture,
  rect: TDraftRect,
  rotation: number,
  opacity: number,
  blendMode: BlendMode,
): void => drawEffectIsolated(context, blendMode, () => drawEffectTexture(context, texture, rect, rotation, opacity));
