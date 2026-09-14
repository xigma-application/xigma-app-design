import { act, renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { Provider } from 'react-redux';

// hooks
import { usePatternSourcePicking } from '../usePatternSourcePicking';

// store
import { selectIsPatternSourcePicking } from 'store/design/selectors';
import { setPatternSourcePicking } from 'store/design/slice';
import { store } from 'store';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

describe('usePatternSourcePicking', () => {
  afterEach(() => {
    store.dispatch(setPatternSourcePicking(false));
  });

  it('should reflect the current isPatternSourcePicking state from the store', () => {
    // before
    store.dispatch(setPatternSourcePicking(true));
    const { result } = renderHook(() => usePatternSourcePicking(), { wrapper });

    // result
    expect(result.current.isActive).toBe(true);
  });

  it('should dispatch true on open()', () => {
    // before
    const { result } = renderHook(() => usePatternSourcePicking(), { wrapper });

    // action
    act(() => result.current.open());

    // result
    expect(selectIsPatternSourcePicking(store.getState())).toBe(true);
  });

  it('should dispatch false on close()', () => {
    // before
    store.dispatch(setPatternSourcePicking(true));
    const { result } = renderHook(() => usePatternSourcePicking(), { wrapper });

    // action
    act(() => result.current.close());

    // result
    expect(selectIsPatternSourcePicking(store.getState())).toBe(false);
  });
});
