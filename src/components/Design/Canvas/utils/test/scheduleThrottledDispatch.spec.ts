// utils
import { scheduleThrottledDispatch } from '../scheduleThrottledDispatch';

describe('scheduleThrottledDispatch', () => {
  it('should schedule a new animation frame the first time, then run the callback once it fires', () => {
    // mock
    let rafCallback: FrameRequestCallback | undefined;

    vi.stubGlobal(
      'requestAnimationFrame',
      vi.fn((callback: FrameRequestCallback) => {
        rafCallback = callback;

        return 7;
      }),
    );

    const state = { frameId: null, run: null };
    const run = vi.fn();

    // before
    scheduleThrottledDispatch(state, run);

    // result
    expect(state.frameId).toBe(7);
    expect(state.run).toBe(run);
    expect(run).not.toHaveBeenCalled();

    // action
    rafCallback?.(0);

    // result — the frame's own callback resets frameId/run and invokes the latest scheduled run
    expect(state.frameId).toBeNull();
    expect(state.run).toBeNull();
    expect(run).toHaveBeenCalledTimes(1);

    vi.unstubAllGlobals();
  });

  it('should not schedule a second animation frame while one is already pending, only replace the run to fire', () => {
    // mock
    const requestAnimationFrameMock = vi.fn(() => 1);

    vi.stubGlobal('requestAnimationFrame', requestAnimationFrameMock);

    const state = { frameId: 1, run: vi.fn() };
    const latestRun = vi.fn();

    // before
    scheduleThrottledDispatch(state, latestRun);

    // result
    expect(requestAnimationFrameMock).not.toHaveBeenCalled();
    expect(state.frameId).toBe(1);
    expect(state.run).toBe(latestRun);

    vi.unstubAllGlobals();
  });
});
