// types
import { TEffect, TSceneNode } from 'types/design/types';
import { TMaskRenderer, TScissorRect } from './types';

// utils
import { acquireGlassBackdrop } from './acquireGlassBackdrop';
import { drawGlassPass } from './drawGlassPass';
import { EFFECT_BLUR_MAX_PX } from '../drawBoxLeafNode/constants';
import { ensureGlassBackdropMipmaps } from './ensureGlassBackdropMipmaps';
import { getEffectGlass } from 'utils/design/effects/getEffectGlass';
import { getLayerBlurRadius } from './getLayerBlurRadius';
import { glassBackdropStates } from './glassBackdropStates';
import { markGlassBackdropDirty } from './markGlassBackdropDirty';
import { setScissorRect } from './setScissorRect';

export const renderDirectGlass = (renderer: TMaskRenderer, node: TSceneNode, effect: TEffect, rect: TScissorRect): void => {
  const { gl } = renderer;
  const backdrop = acquireGlassBackdrop(renderer, rect, true);
  const state = glassBackdropStates.get(renderer);
  const frostRadius = getLayerBlurRadius(renderer, (getEffectGlass(effect).frost / 100) * EFFECT_BLUR_MAX_PX);
  const frostLod = frostRadius >= 1 ? Math.log2(frostRadius) : 0;

  if (state && frostLod > 0) {
    ensureGlassBackdropMipmaps(renderer, state);
  }

  setScissorRect(gl, rect);
  drawGlassPass(renderer, node, effect, backdrop, { height: gl.drawingBufferHeight, width: gl.drawingBufferWidth }, true, frostLod);
  setScissorRect(gl, null);
  markGlassBackdropDirty(renderer, rect);
};
