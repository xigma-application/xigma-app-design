// types
import { TMaskRenderer, TScissorRect } from './types';
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';

// utils
import { captureBackdropTexture } from './captureBackdropTexture';
import { doScissorRectsOverlap } from './doScissorRectsOverlap';
import { glassBackdropStates } from './glassBackdropStates';
import { releaseGlassBackdropTarget } from './releaseGlassBackdropTarget';

export const acquireGlassBackdrop = (renderer: TMaskRenderer, rect: TScissorRect, reuseWhenDirty = false): TRenderTarget => {
  const { gl } = renderer;
  const state = glassBackdropStates.get(renderer) ?? { backdrop: null, dirty: [], fullyDirty: false, isMipmapped: false };

  glassBackdropStates.set(renderer, state);

  if (
    state.backdrop &&
    (reuseWhenDirty || (!state.fullyDirty && !state.dirty.some((dirty) => doScissorRectsOverlap(dirty, rect))))
  ) {
    return state.backdrop;
  }

  releaseGlassBackdropTarget(renderer, state);
  state.backdrop = captureBackdropTexture(renderer, { height: gl.drawingBufferHeight, width: gl.drawingBufferWidth, x: 0, y: 0 });
  state.dirty = [];
  state.fullyDirty = false;

  return state.backdrop;
};
