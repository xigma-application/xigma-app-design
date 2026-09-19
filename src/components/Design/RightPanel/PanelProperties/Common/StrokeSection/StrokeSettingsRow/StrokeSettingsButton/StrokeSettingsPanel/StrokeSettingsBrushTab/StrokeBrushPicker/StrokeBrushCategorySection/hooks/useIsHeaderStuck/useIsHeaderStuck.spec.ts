import { act, renderHook } from '@testing-library/react';

// hooks
import { useIsHeaderStuck } from './useIsHeaderStuck';

type TObserverCallback = (entries: Partial<IntersectionObserverEntry>[]) => void;

describe('useIsHeaderStuck', () => {
  let callback: TObserverCallback = () => undefined;
  const disconnect = vi.fn();

  beforeEach(() => {
    disconnect.mockClear();
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(handler: TObserverCallback) {
          callback = handler;
        }
        disconnect = disconnect;
        observe = vi.fn();
      },
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should be stuck only while the header is not fully visible', () => {
    // Step 1: Render with an attached header
    const { result } = renderHook(() => useIsHeaderStuck({ current: document.createElement('div') }));

    // Step 2: Assert it starts not stuck
    expect(result.current).toBe(false);

    // Step 3: Header partially pushed under the top edge
    act(() => callback([{ intersectionRatio: 0.9 }]));
    expect(result.current).toBe(true);

    // Step 4: Header fully visible again
    act(() => callback([{ intersectionRatio: 1 }]));
    expect(result.current).toBe(false);
  });

  it('should disconnect the observer on unmount', () => {
    // Step 1: Render and unmount
    const { unmount } = renderHook(() => useIsHeaderStuck({ current: document.createElement('div') }));

    unmount();

    // Step 2: Assert the observer was disconnected
    expect(disconnect).toHaveBeenCalled();
  });

  it('should stay not stuck without a header element', () => {
    // Step 1: Render with an empty ref
    const { result } = renderHook(() => useIsHeaderStuck({ current: null }));

    // Step 2: Assert
    expect(result.current).toBe(false);
  });
});
