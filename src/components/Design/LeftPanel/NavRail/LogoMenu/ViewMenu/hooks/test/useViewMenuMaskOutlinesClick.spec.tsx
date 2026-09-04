import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ReactNode } from 'react';

// hooks
import { useViewMenuMaskOutlinesClick } from '../useViewMenuMaskOutlinesClick';

// store
import { selectAreMaskOutlinesVisible } from 'store/design/selectors';
import { store } from 'store';
import { toggleMaskOutlinesVisible } from 'store/design/slice';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

describe('useViewMenuMaskOutlinesClick', () => {
  beforeEach(() => {
    if (selectAreMaskOutlinesVisible(store.getState())) {
      store.dispatch(toggleMaskOutlinesVisible());
    }
  });

  it('should toggle the mask outlines visibility flag when called', () => {
    // before
    const { result } = renderHook(() => useViewMenuMaskOutlinesClick(), { wrapper });

    // action
    result.current();

    // result
    expect(selectAreMaskOutlinesVisible(store.getState())).toBe(true);
  });
});
