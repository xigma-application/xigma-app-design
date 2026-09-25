import { FC, ReactNode } from 'react';
import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';

// hooks
import { useViewMenuLayoutGuidesClick } from '../useViewMenuLayoutGuidesClick';

// store
import { store } from 'store';

const toggleMock = vi.fn();

vi.mock('components/Design/Canvas/hooks/useKeyboardShortcuts/utils/handleToggleLayoutGuides', () => ({
  handleToggleLayoutGuides: (...args: unknown[]): unknown => toggleMock(...args),
}));

const wrapper: FC<{ children: ReactNode }> = ({ children }) => <Provider store={store}>{children}</Provider>;

describe('useViewMenuLayoutGuidesClick', () => {
  it('should toggle the layout guides', () => {
    // before
    const { result } = renderHook(() => useViewMenuLayoutGuidesClick(), { wrapper });

    // action
    result.current();

    // result
    expect(toggleMock).toHaveBeenCalledWith(store.dispatch);
  });
});
