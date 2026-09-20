import { act, ReactNode } from 'react';
import { Provider } from 'react-redux';
import { renderHook } from '@testing-library/react';

// hooks
import { useActiveViewport } from './useActiveViewport';

// store
import { setViewport } from 'store/design/slice';
import { store } from 'store';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

describe('useActiveViewport', () => {
  it('should return the live viewport while active and follow its changes', () => {
    // mock
    const { result } = renderHook(() => useActiveViewport(true), { wrapper });

    // action
    act(() => {
      store.dispatch(setViewport({ x: 40, y: 20, zoom: 2 }));
    });

    // result
    expect(result.current).toEqual({ x: 40, y: 20, zoom: 2 });
  });

  it('should keep returning the same idle viewport, without re-rendering, while inactive', () => {
    // mock
    let renders = 0;
    const { result } = renderHook(
      () => {
        renders += 1;
        return useActiveViewport(false);
      },
      { wrapper },
    );
    const first = result.current;
    const rendersBefore = renders;

    // action
    act(() => {
      store.dispatch(setViewport({ x: 500, y: 500, zoom: 3 }));
    });

    // result
    expect(result.current).toBe(first);
    expect(renders).toBe(rendersBefore);
  });
});
