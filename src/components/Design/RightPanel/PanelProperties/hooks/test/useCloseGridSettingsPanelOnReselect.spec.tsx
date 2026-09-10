import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { renderHook } from '@testing-library/react';

// hooks
import { useCloseGridSettingsPanelOnReselect } from '../useCloseGridSettingsPanelOnReselect';

// store
import { selectIsGridSettingsPanelOpen } from 'store/design/selectors';
import { setGridSettingsPanelOpen } from 'store/design/slice';
import { store } from 'store';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

describe('useCloseGridSettingsPanelOnReselect', () => {
  beforeEach(() => {
    store.dispatch(setGridSettingsPanelOpen(false));
  });

  it('should close the panel when a selection appears after having been empty', () => {
    store.dispatch(setGridSettingsPanelOpen(true));
    const { rerender } = renderHook(({ hasSelection }) => useCloseGridSettingsPanelOnReselect(hasSelection, true), {
      initialProps: { hasSelection: false },
      wrapper,
    });

    rerender({ hasSelection: true });

    expect(selectIsGridSettingsPanelOpen(store.getState())).toBe(false);
  });

  it('should not touch the panel state while nothing was ever selected', () => {
    store.dispatch(setGridSettingsPanelOpen(true));
    renderHook(({ hasSelection }) => useCloseGridSettingsPanelOnReselect(hasSelection, true), {
      initialProps: { hasSelection: false },
      wrapper,
    });

    expect(selectIsGridSettingsPanelOpen(store.getState())).toBe(true);
  });

  it('should not close an already-closed panel', () => {
    const { rerender } = renderHook(({ hasSelection }) => useCloseGridSettingsPanelOnReselect(hasSelection, false), {
      initialProps: { hasSelection: false },
      wrapper,
    });

    rerender({ hasSelection: true });

    expect(selectIsGridSettingsPanelOpen(store.getState())).toBe(false);
  });

  it('should not close the panel when the selection was already present on mount', () => {
    store.dispatch(setGridSettingsPanelOpen(true));
    renderHook(() => useCloseGridSettingsPanelOnReselect(true, true), { wrapper });

    expect(selectIsGridSettingsPanelOpen(store.getState())).toBe(true);
  });

  it('should not reopen the panel when the selection is cleared', () => {
    store.dispatch(setGridSettingsPanelOpen(true));
    const { rerender } = renderHook(({ hasSelection }) => useCloseGridSettingsPanelOnReselect(hasSelection, true), {
      initialProps: { hasSelection: true },
      wrapper,
    });

    rerender({ hasSelection: false });

    expect(selectIsGridSettingsPanelOpen(store.getState())).toBe(true);
  });
});
