import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ReactNode } from 'react';

// hooks
import { useViewMenuRulersClick } from '../useViewMenuRulersClick';

// store
import { selectAreRulersVisible } from 'store/design/selectors';
import { store } from 'store';
import { toggleRulers } from 'store/design/slice';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

describe('useViewMenuRulersClick', () => {
  beforeEach(() => {
    if (selectAreRulersVisible(store.getState())) {
      store.dispatch(toggleRulers());
    }
  });

  it('should toggle the rulers visibility flag when called', () => {
    // before
    const { result } = renderHook(() => useViewMenuRulersClick(), { wrapper });

    // action
    result.current();

    // result
    expect(selectAreRulersVisible(store.getState())).toBe(true);
  });
});
