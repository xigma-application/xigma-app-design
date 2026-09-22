// types
import { TMaskRenderer, TScissorRect } from './types';
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';

// utils
import { captureBackdropTexture } from './captureBackdropTexture';
import { doScissorRectsOverlap } from './doScissorRectsOverlap';
import { getDevicePixelHeight } from '../getDevicePixelHeight';
import { getDevicePixelWidth } from '../getDevicePixelWidth';
import { glassBackdropStates } from './glassBackdropStates';
import { releaseGlassBackdropTarget } from './releaseGlassBackdropTarget';

export const acquireGlassBackdrop = (renderer: TMaskRenderer, rect: TScissorRect, reuseWhenDirty = false): TRenderTarget => {
  const { context, gl } = renderer;
  const state = glassBackdropStates.get(renderer) ?? { backdrop: null, dirty: [], fullyDirty: false, isMipmapped: false };

  glassBackdropStates.set(renderer, state);

  if (state.backdrop && (reuseWhenDirty || (!state.fullyDirty && !state.dirty.some((dirty) => doScissorRectsOverlap(dirty, rect))))) {
    return state.backdrop;
  }

  releaseGlassBackdropTarget(renderer, state);
  state.backdrop = captureBackdropTexture(renderer, {
    height: getDevicePixelHeight(context, gl),
    width: getDevicePixelWidth(context, gl),
    x: 0,
    y: 0,
  });
  state.dirty = [];
  state.fullyDirty = false;

  return state.backdrop;
};
