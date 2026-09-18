import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { renderHook } from '@testing-library/react';

// hooks
import { useSyncGradientEditor } from '../useSyncGradientEditor';

// store
import { selectGradientEditor } from 'store/design/selectors';
import { setGradientEditor } from 'store/design/slice';
import { store } from 'store';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

describe('useSyncGradientEditor', () => {
  afterEach(() => {
    store.dispatch(setGradientEditor(null));
  });

  it('should set the gradient editor when the picker is open on the gradient tab with a nodeId', () => {
    // before
    renderHook(() => useSyncGradientEditor('node-1', 2, 'fills', true, { isGradientTabActive: true, selectedStopIndex: 1 }), { wrapper });

    // result
    expect(selectGradientEditor(store.getState())).toEqual({ nodeId: 'node-1', paintIndex: 2, property: 'fills', selectedStopIndex: 1 });
  });

  it('should not touch the gradient editor on mount when the picker is closed', () => {
    // before
    renderHook(() => useSyncGradientEditor('node-1', 0, 'fills', false, { isGradientTabActive: true, selectedStopIndex: null }), {
      wrapper,
    });

    // result
    expect(selectGradientEditor(store.getState())).toBeNull();
  });

  it('should clear the gradient editor once it was set and the picker then closes', () => {
    // before
    const { rerender } = renderHook(
      ({ isPickerOpen }) =>
        useSyncGradientEditor('node-1', 0, 'fills', isPickerOpen, { isGradientTabActive: true, selectedStopIndex: null }),
      {
        initialProps: { isPickerOpen: true },
        wrapper,
      },
    );

    expect(selectGradientEditor(store.getState())).toEqual({ nodeId: 'node-1', paintIndex: 0, property: 'fills', selectedStopIndex: null });

    // action
    rerender({ isPickerOpen: false });

    // result
    expect(selectGradientEditor(store.getState())).toBeNull();
  });

  it('should clear the gradient editor when there is no nodeId', () => {
    // before
    const { rerender } = renderHook(
      ({ nodeId }) => useSyncGradientEditor(nodeId, 0, 'fills', true, { isGradientTabActive: true, selectedStopIndex: null }),
      {
        initialProps: { nodeId: 'node-1' as string | undefined },
        wrapper,
      },
    );

    // action
    rerender({ nodeId: undefined });

    // result
    expect(selectGradientEditor(store.getState())).toBeNull();
  });

  it('should clear the gradient editor on unmount', () => {
    // before
    const { unmount } = renderHook(
      () => useSyncGradientEditor('node-1', 0, 'fills', true, { isGradientTabActive: true, selectedStopIndex: null }),
      { wrapper },
    );

    // action
    unmount();

    // result
    expect(selectGradientEditor(store.getState())).toBeNull();
  });

  it("should not clear a sibling fill's gradient editor state (regression: switching from a higher-index gradient fill back to a lower-index one wiped it back to null, because the higher-index row's own cleanup ran after the lower-index row's activation and unconditionally cleared whatever was there)", () => {
    // before — two rows rendered together, exactly like sibling FillRows under the same FillSection;
    // fill 1 (called second, matching its higher index) currently owns the editor
    const useTwoRows = (activeIndex: number | null): void => {
      useSyncGradientEditor('node-1', 0, 'fills', activeIndex === 0, { isGradientTabActive: activeIndex === 0, selectedStopIndex: null });
      useSyncGradientEditor('node-1', 1, 'fills', activeIndex === 1, { isGradientTabActive: activeIndex === 1, selectedStopIndex: null });
    };

    const { rerender } = renderHook(({ activeIndex }) => useTwoRows(activeIndex), {
      initialProps: { activeIndex: 1 as number | null },
      wrapper,
    });

    expect(selectGradientEditor(store.getState())).toEqual({ nodeId: 'node-1', paintIndex: 1, property: 'fills', selectedStopIndex: null });

    // action — a single render transition: fill 0 activates and fill 1 deactivates together, the
    // same way both derive from one shared openPickerIndex changing in the real app
    rerender({ activeIndex: 0 });

    // result — fill 0's claim survives; fill 1's own cleanup must not have clobbered it back to null
    expect(selectGradientEditor(store.getState())).toEqual({ nodeId: 'node-1', paintIndex: 0, property: 'fills', selectedStopIndex: null });
  });

  it('should tag the editor with the strokes property and not clear a fills editor of the same index', () => {
    // before
    store.dispatch(setGradientEditor({ nodeId: 'node-1', paintIndex: 0, property: 'fills', selectedStopIndex: null }));
    const { unmount } = renderHook(
      () => useSyncGradientEditor('node-1', 0, 'strokes', true, { isGradientTabActive: true, selectedStopIndex: 1 }),
      { wrapper },
    );

    // result
    expect(selectGradientEditor(store.getState())).toEqual({ nodeId: 'node-1', paintIndex: 0, property: 'strokes', selectedStopIndex: 1 });

    // action — restore the fills editor as if its row re-activated, then unmount the strokes row
    store.dispatch(setGradientEditor({ nodeId: 'node-1', paintIndex: 0, property: 'fills', selectedStopIndex: null }));
    unmount();

    // result
    expect(selectGradientEditor(store.getState())).toEqual({ nodeId: 'node-1', paintIndex: 0, property: 'fills', selectedStopIndex: null });
  });
});
