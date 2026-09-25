import { FC, ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';

// hooks
import { useToggleUiMinimized } from '../useToggleUiMinimized';

// store
import { store } from 'store';

const wrapper: FC<{ children: ReactNode }> = ({ children }) => <Provider store={store}>{children}</Provider>;

describe('useToggleUiMinimized', () => {
  it('should toggle the minimized UI', () => {
    // mock
    const before = store.getState().design.isUiMinimized;

    // before
    const { result } = renderHook(() => useToggleUiMinimized(), { wrapper });

    // action
    act(() => result.current());

    // result
    expect(store.getState().design.isUiMinimized).toBe(!before);

    // cleanup
    act(() => result.current());
  });
});
