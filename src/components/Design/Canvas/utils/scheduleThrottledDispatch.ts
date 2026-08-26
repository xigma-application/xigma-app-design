// types
import { TThrottledDispatchState } from 'types/design/selectionTool/types';

export const scheduleThrottledDispatch = (state: TThrottledDispatchState, run: () => void): void => {
  state.run = run;

  if (state.frameId === null) {
    state.frameId = requestAnimationFrame(() => {
      const pendingRun = state.run;

      state.frameId = null;
      state.run = null;
      pendingRun?.();
    });
  }
};
