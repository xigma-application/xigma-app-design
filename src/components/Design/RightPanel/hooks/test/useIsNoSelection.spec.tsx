import { Provider } from 'react-redux';
import { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';

// hooks
import { useIsNoSelection } from '../useIsNoSelection';

// store
import { setActiveTool, setSelection } from 'store/design/slice';
import { store } from 'store';

// types
import { ToolName } from 'types/design/enums';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

describe('useIsNoSelection behaviors', () => {
  afterEach(() => {
    store.dispatch(setActiveTool(ToolName.default));
    store.dispatch(setSelection([]));
  });

  it('should be true when nothing is selected and the frame tool is not active', () => {
    // before
    const { result } = renderHook(() => useIsNoSelection(), { wrapper });

    // result
    expect(result.current).toBe(true);
  });

  it('should be false when a node is selected', () => {
    // before
    store.dispatch(setSelection(['node-1']));

    const { result } = renderHook(() => useIsNoSelection(), { wrapper });

    // result
    expect(result.current).toBe(false);
  });

  it('should be false while the frame tool is active, even with no selection', () => {
    // before
    store.dispatch(setActiveTool(ToolName.frame));

    const { result } = renderHook(() => useIsNoSelection(), { wrapper });

    // result
    expect(result.current).toBe(false);
  });
});
