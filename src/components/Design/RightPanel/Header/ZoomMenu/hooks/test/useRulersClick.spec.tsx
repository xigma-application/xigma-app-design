import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ReactNode } from 'react';

// hooks
import { useRulersClick } from '../useRulersClick';

// store
import { store } from 'store';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

describe('useRulersClick', () => {
  it('should toggle the rulers visibility flag when called', () => {
    // before
    const before = store.getState().design.preferences.areRulersVisible;
    const { result } = renderHook(() => useRulersClick(), { wrapper });

    // action
    result.current();

    // result
    expect(store.getState().design.preferences.areRulersVisible).toBe(!before);
  });
});
