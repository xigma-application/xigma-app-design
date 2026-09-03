import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ReactNode, RefObject } from 'react';

// hooks
import { useLogoMenuActionsClick } from '../useLogoMenuActionsClick';

// store
import { selectIsActionsPanelOpen } from 'store/design/selectors';
import { setActionsPanelOpen } from 'store/design/slice';
import { store } from 'store';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

describe('useLogoMenuActionsClick', () => {
  beforeEach(() => {
    store.dispatch(setActionsPanelOpen(false));
  });

  it('should open the Actions panel when called', () => {
    // mock
    const ref: RefObject<boolean> = { current: false };

    // before
    const { result } = renderHook(() => useLogoMenuActionsClick(ref), { wrapper });

    // action
    result.current();

    // result
    expect(selectIsActionsPanelOpen(store.getState())).toBe(true);
  });

  it('should mark the skip-close-auto-focus ref when called', () => {
    // mock
    const ref: RefObject<boolean> = { current: false };

    // before
    const { result } = renderHook(() => useLogoMenuActionsClick(ref), { wrapper });

    // action
    result.current();

    // result
    expect(ref.current).toBe(true);
  });
});
