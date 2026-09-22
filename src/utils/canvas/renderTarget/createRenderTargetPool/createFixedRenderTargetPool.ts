// utils
import { createTarget } from './createTarget';
import { disposeTarget } from './disposeTarget';

// types
import { TRenderTarget, TRenderTargetPool } from './types';

type TFixedRenderTargetPoolState = { all: TRenderTarget[]; free: TRenderTarget[] };

const acquire = (gl: WebGL2RenderingContext, width: number, height: number, state: TFixedRenderTargetPoolState): TRenderTarget => {
  const recycled = state.free.pop();

  if (!recycled) {
    const target = createTarget(gl, width, height);
    state.all.push(target);

    return target;
  }

  return recycled;
};

const release = (state: TFixedRenderTargetPoolState, target: TRenderTarget): void => {
  if (state.all.includes(target) && !state.free.includes(target)) {
    state.free.push(target);
  }
};

const disposeAll = (gl: WebGL2RenderingContext, state: TFixedRenderTargetPoolState): void => {
  state.all.forEach((target) => disposeTarget(gl, target));
  state.all = [];
  state.free = [];
};

export const createFixedRenderTargetPool = (gl: WebGL2RenderingContext, width: number, height: number): TRenderTargetPool => {
  const state: TFixedRenderTargetPoolState = { all: [], free: [] };

  return {
    acquire: () => acquire(gl, width, height, state),
    dispose: () => disposeAll(gl, state),
    release: (target) => release(state, target),
  };
};
