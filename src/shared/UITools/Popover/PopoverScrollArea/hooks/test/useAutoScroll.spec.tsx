import { act, renderHook } from '@testing-library/react';
import { RefObject } from 'react';

// hooks
import { useAutoScroll } from '../useAutoScroll';

describe('useAutoScroll', () => {
  let rafCallbacks: FrameRequestCallback[];
  let cancelledIds: number[];

  beforeEach(() => {
    rafCallbacks = [];
    cancelledIds = [];
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      rafCallbacks.push(cb);

      return rafCallbacks.length;
    });
    vi.stubGlobal('cancelAnimationFrame', (id: number) => {
      cancelledIds.push(id);
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const flush = (): void => {
    const callback = rafCallbacks.shift();

    callback?.(0);
  };

  it('should scroll the element down on each animation frame while scrolling down', () => {
    // before
    const element = document.createElement('div');
    const ref = { current: element } as RefObject<HTMLDivElement | null>;
    const { result } = renderHook(() => useAutoScroll(ref));

    // action
    act(() => result.current.startScrolling('down'));
    flush();
    flush();

    // result
    expect(element.scrollTop).toBe(10);
  });

  it('should scroll the element up on each animation frame while scrolling up', () => {
    // before
    const element = document.createElement('div');
    element.scrollTop = 10;
    const ref = { current: element } as RefObject<HTMLDivElement | null>;
    const { result } = renderHook(() => useAutoScroll(ref));

    // action
    act(() => result.current.startScrolling('up'));
    flush();

    // result
    expect(element.scrollTop).toBe(5);
  });

  it('should stop scheduling frames once stopScrolling is called', () => {
    // before
    const element = document.createElement('div');
    const ref = { current: element } as RefObject<HTMLDivElement | null>;
    const { result } = renderHook(() => useAutoScroll(ref));

    // action
    act(() => result.current.startScrolling('down'));
    act(() => result.current.stopScrolling());

    // result
    expect(cancelledIds).toEqual([rafCallbacks.length]);
  });

  it('should do nothing when stopScrolling is called without a pending frame', () => {
    // before
    const element = document.createElement('div');
    const ref = { current: element } as RefObject<HTMLDivElement | null>;
    const { result } = renderHook(() => useAutoScroll(ref));

    // action
    act(() => result.current.stopScrolling());

    // result
    expect(cancelledIds).toHaveLength(0);
  });

  it('should stop the previous loop when starting a new scroll direction', () => {
    // before
    const element = document.createElement('div');
    const ref = { current: element } as RefObject<HTMLDivElement | null>;
    const { result } = renderHook(() => useAutoScroll(ref));

    // action
    act(() => result.current.startScrolling('down'));
    act(() => result.current.startScrolling('up'));

    // result
    expect(cancelledIds).toHaveLength(1);
  });

  it('should do nothing when the ref becomes null while a frame is pending', () => {
    // before
    const element = document.createElement('div');
    const ref = { current: element } as RefObject<HTMLDivElement | null>;
    const { result } = renderHook(() => useAutoScroll(ref));

    // action
    act(() => result.current.startScrolling('down'));
    ref.current = null;
    flush();

    // result
    expect(rafCallbacks).toHaveLength(0);
  });
});
