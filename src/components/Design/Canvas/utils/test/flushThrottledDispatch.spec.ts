// types
import { TThrottledDispatchState } from 'types/design/selectionTool/types';

// utils
import { flushThrottledDispatch } from '../flushThrottledDispatch';

describe('flushThrottledDispatch', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should cancel the scheduled frame and run the pending dispatch right away', () => {
    // mock
    const cancel = vi.fn();
    const run = vi.fn();
    const state: TThrottledDispatchState = { frameId: 7, run };
    vi.stubGlobal('cancelAnimationFrame', cancel);

    // before
    flushThrottledDispatch(state);

    // result
    expect(cancel).toHaveBeenCalledWith(7);
    expect(run).toHaveBeenCalledTimes(1);
    expect(state).toEqual({ frameId: null, run: null });
  });

  it('should do nothing without a scheduled frame or a pending dispatch', () => {
    // mock
    const cancel = vi.fn();
    vi.stubGlobal('cancelAnimationFrame', cancel);

    // before
    flushThrottledDispatch({ frameId: null, run: null });

    // result
    expect(cancel).not.toHaveBeenCalled();
  });
});
