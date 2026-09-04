import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ReactNode } from 'react';

// hooks
import { useViewMenuFrameOutlinesClick } from '../useViewMenuFrameOutlinesClick';

// store
import { selectAreFrameOutlinesVisible } from 'store/design/selectors';
import { store } from 'store';
import { toggleFrameOutlinesVisible } from 'store/design/slice';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

describe('useViewMenuFrameOutlinesClick', () => {
  beforeEach(() => {
    if (selectAreFrameOutlinesVisible(store.getState())) {
      store.dispatch(toggleFrameOutlinesVisible());
    }
  });

  it('should toggle the frame outlines visibility flag when called', () => {
    // before
    const { result } = renderHook(() => useViewMenuFrameOutlinesClick(), { wrapper });

    // action
    result.current();

    // result
    expect(selectAreFrameOutlinesVisible(store.getState())).toBe(true);
  });
});
