// types
import { TThrottledDispatchState } from 'types/design/selectionTool/types';

export const flushThrottledDispatch = (state: TThrottledDispatchState): void => {
  if (state.frameId !== null) {
    cancelAnimationFrame(state.frameId);
    state.frameId = null;
  }

  const pendingRun = state.run;

  state.run = null;
  pendingRun?.();
};
