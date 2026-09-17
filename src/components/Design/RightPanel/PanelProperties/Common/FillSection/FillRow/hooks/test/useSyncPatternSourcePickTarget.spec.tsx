import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { renderHook } from '@testing-library/react';

// hooks
import { useSyncPatternSourcePickTarget } from '../useSyncPatternSourcePickTarget';

// store
import { selectPatternSourcePickTarget } from 'store/design/selectors';
import { setPatternSourcePickTarget } from 'store/design/slice';
import { store } from 'store';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

describe('useSyncPatternSourcePickTarget', () => {
  afterEach(() => {
    store.dispatch(setPatternSourcePickTarget(null));
  });

  it('should set the pattern source pick target when the picker is open on a pattern paint with a nodeId', () => {
    // before
    renderHook(() => useSyncPatternSourcePickTarget('node-1', 2, true, true), { wrapper });

    // result
    expect(selectPatternSourcePickTarget(store.getState())).toEqual({ nodeId: 'node-1', paintIndex: 2 });
  });

  it('should not touch the target on mount when the picker is closed', () => {
    // before
    renderHook(() => useSyncPatternSourcePickTarget('node-1', 0, false, true), { wrapper });

    // result
    expect(selectPatternSourcePickTarget(store.getState())).toBeNull();
  });

  it('should clear the target once it was set and the picker then closes', () => {
    // before
    const { rerender } = renderHook(({ isPickerOpen }) => useSyncPatternSourcePickTarget('node-1', 0, isPickerOpen, true), {
      initialProps: { isPickerOpen: true },
      wrapper,
    });

    expect(selectPatternSourcePickTarget(store.getState())).toEqual({ nodeId: 'node-1', paintIndex: 0 });

    // action
    rerender({ isPickerOpen: false });

    // result
    expect(selectPatternSourcePickTarget(store.getState())).toBeNull();
  });

  it('should clear the target once it was set and the paint stops being a pattern', () => {
    // before
    const { rerender } = renderHook(({ isPattern }) => useSyncPatternSourcePickTarget('node-1', 0, true, isPattern), {
      initialProps: { isPattern: true },
      wrapper,
    });

    expect(selectPatternSourcePickTarget(store.getState())).toEqual({ nodeId: 'node-1', paintIndex: 0 });

    // action
    rerender({ isPattern: false });

    // result
    expect(selectPatternSourcePickTarget(store.getState())).toBeNull();
  });

  it('should clear the target when there is no nodeId', () => {
    // before
    const { rerender } = renderHook(({ nodeId }) => useSyncPatternSourcePickTarget(nodeId, 0, true, true), {
      initialProps: { nodeId: 'node-1' as string | undefined },
      wrapper,
    });

    // action
    rerender({ nodeId: undefined });

    // result
    expect(selectPatternSourcePickTarget(store.getState())).toBeNull();
  });

  it('should clear the target on unmount', () => {
    // before
    const { unmount } = renderHook(() => useSyncPatternSourcePickTarget('node-1', 0, true, true), { wrapper });

    // action
    unmount();

    // result
    expect(selectPatternSourcePickTarget(store.getState())).toBeNull();
  });

  it("should not clear a sibling fill's pattern source pick target (regression: switching from a higher-index pattern fill back to a lower-index one wiped it back to null, because the higher-index row's own cleanup ran after the lower-index row's activation and unconditionally cleared whatever was there)", () => {
    // before — two rows rendered together, exactly like sibling FillRows under the same FillSection;
    // fill 1 (called second, matching its higher index) currently owns the target
    const useTwoRows = (activeIndex: number | null): void => {
      useSyncPatternSourcePickTarget('node-1', 0, activeIndex === 0, activeIndex === 0);
      useSyncPatternSourcePickTarget('node-1', 1, activeIndex === 1, activeIndex === 1);
    };

    const { rerender } = renderHook(({ activeIndex }) => useTwoRows(activeIndex), {
      initialProps: { activeIndex: 1 as number | null },
      wrapper,
    });

    expect(selectPatternSourcePickTarget(store.getState())).toEqual({ nodeId: 'node-1', paintIndex: 1 });

    // action — a single render transition: fill 0 activates and fill 1 deactivates together, the
    // same way both derive from one shared openPickerIndex changing in the real app
    rerender({ activeIndex: 0 });

    // result — fill 0's claim survives; fill 1's own cleanup must not have clobbered it back to null
    expect(selectPatternSourcePickTarget(store.getState())).toEqual({ nodeId: 'node-1', paintIndex: 0 });
  });
});
