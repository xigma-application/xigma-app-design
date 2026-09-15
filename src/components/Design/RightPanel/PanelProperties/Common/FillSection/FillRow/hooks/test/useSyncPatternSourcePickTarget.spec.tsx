import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { renderHook } from '@testing-library/react';

// hooks
import { useSyncPatternSourcePickTarget } from '../useSyncPatternSourcePickTarget';

// store
import { selectPatternSourcePickTarget } from 'store/design/selectors';
import { store } from 'store';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

describe('useSyncPatternSourcePickTarget', () => {
  it('should set the pattern source pick target when the picker is open on a pattern paint with a nodeId', () => {
    // before
    renderHook(() => useSyncPatternSourcePickTarget('node-1', 2, true, true), { wrapper });

    // result
    expect(selectPatternSourcePickTarget(store.getState())).toEqual({ nodeId: 'node-1', paintIndex: 2 });
  });

  it('should clear the target when the picker is closed', () => {
    // before
    renderHook(() => useSyncPatternSourcePickTarget('node-1', 0, false, true), { wrapper });

    // result
    expect(selectPatternSourcePickTarget(store.getState())).toBeNull();
  });

  it('should clear the target when the paint is not a pattern', () => {
    // before
    renderHook(() => useSyncPatternSourcePickTarget('node-1', 0, true, false), { wrapper });

    // result
    expect(selectPatternSourcePickTarget(store.getState())).toBeNull();
  });

  it('should clear the target when there is no nodeId', () => {
    // before
    renderHook(() => useSyncPatternSourcePickTarget(undefined, 0, true, true), { wrapper });

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
});
