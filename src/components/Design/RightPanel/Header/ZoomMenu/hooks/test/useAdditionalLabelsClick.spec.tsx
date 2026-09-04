import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ReactNode } from 'react';

// hooks
import { useAdditionalLabelsClick } from '../useAdditionalLabelsClick';

// store
import { store } from 'store';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

describe('useAdditionalLabelsClick', () => {
  it('should toggle the additional-labels visibility flag when called', () => {
    // before
    const before = store.getState().design.areAdditionalLabelsVisible;
    const { result } = renderHook(() => useAdditionalLabelsClick(), { wrapper });

    // action
    result.current();

    // result
    expect(store.getState().design.areAdditionalLabelsVisible).toBe(!before);
  });
});
