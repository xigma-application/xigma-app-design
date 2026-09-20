// types
import { TDraftRect } from 'types/canvas';
import { TDrawSceneContext } from '../types';

// others
import { EFFECT_NEUTRAL_IMAGE_ADJUSTMENT_UNIFORMS } from './constants';

// utils
import { drawImage } from 'utils/canvas/drawImage';

export const drawEffectTexture = (
  context: TDrawSceneContext,
  texture: WebGLTexture,
  rect: TDraftRect,
  rotation: number,
  opacity: number,
): void => {
  const { canvasHeight, canvasWidth, gl, imageContext, viewport } = context;
  const { buffer, program } = imageContext;

  gl.useProgram(program);
  EFFECT_NEUTRAL_IMAGE_ADJUSTMENT_UNIFORMS.forEach((name) => gl.uniform1f(gl.getUniformLocation(program, name), 0));
  drawImage(gl, program, buffer, texture, rect, canvasWidth, canvasHeight, viewport, false, true, rotation, opacity);
};
