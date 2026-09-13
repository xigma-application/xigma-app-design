import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { renderHook } from '@testing-library/react';

// hooks
import { useSyncGradientEditor } from '../useSyncGradientEditor';

// store
import { selectGradientEditor } from 'store/design/selectors';
import { store } from 'store';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

describe('useSyncGradientEditor', () => {
  it('should set the gradient editor when the picker is open on the gradient tab with a nodeId', () => {
    // before
    renderHook(() => useSyncGradientEditor('node-1', 2, true, true, 1), { wrapper });

    // result
    expect(selectGradientEditor(store.getState())).toEqual({ nodeId: 'node-1', paintIndex: 2, selectedStopIndex: 1 });
  });

  it('should clear the gradient editor when the picker is closed', () => {
    // before
    renderHook(() => useSyncGradientEditor('node-1', 0, false, true, null), { wrapper });

    // result
    expect(selectGradientEditor(store.getState())).toBeNull();
  });

  it('should clear the gradient editor when the gradient tab is not active', () => {
    // before
    renderHook(() => useSyncGradientEditor('node-1', 0, true, false, null), { wrapper });

    // result
    expect(selectGradientEditor(store.getState())).toBeNull();
  });

  it('should clear the gradient editor when there is no nodeId', () => {
    // before
    renderHook(() => useSyncGradientEditor(undefined, 0, true, true, null), { wrapper });

    // result
    expect(selectGradientEditor(store.getState())).toBeNull();
  });

  it('should clear the gradient editor on unmount', () => {
    // before
    const { unmount } = renderHook(() => useSyncGradientEditor('node-1', 0, true, true, null), { wrapper });

    // action
    unmount();

    // result
    expect(selectGradientEditor(store.getState())).toBeNull();
  });
});
