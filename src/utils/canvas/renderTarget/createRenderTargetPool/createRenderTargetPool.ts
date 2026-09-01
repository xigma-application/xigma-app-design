// utils
import { createTarget } from './createTarget';
import { disposeTarget } from './disposeTarget';

// types
import { TRenderTarget, TRenderTargetPool, TRenderTargetPoolState } from './types';

const disposeAll = (gl: WebGL2RenderingContext, state: TRenderTargetPoolState): void => {
  state.all.forEach((target) => disposeTarget(gl, target));
  state.all = [];
  state.free = [];
};

const acquire = (gl: WebGL2RenderingContext, state: TRenderTargetPoolState): TRenderTarget => {
  const width = gl.drawingBufferWidth;
  const height = gl.drawingBufferHeight;

  if (width !== state.poolWidth || height !== state.poolHeight) {
    disposeAll(gl, state);
    state.poolWidth = width;
    state.poolHeight = height;
  }

  const recycled = state.free.pop();

  if (!recycled) {
    const target = createTarget(gl, width, height);
    state.all.push(target);

    return target;
  }

  return recycled;
};

const release = (state: TRenderTargetPoolState, target: TRenderTarget): void => {
  if (state.all.includes(target) && !state.free.includes(target)) {
    state.free.push(target);
  }
};

export const createRenderTargetPool = (gl: WebGL2RenderingContext): TRenderTargetPool => {
  const state: TRenderTargetPoolState = { all: [], free: [], poolHeight: 0, poolWidth: 0 };

  return {
    acquire: () => acquire(gl, state),
    dispose: () => disposeAll(gl, state),
    release: (target) => release(state, target),
  };
};
