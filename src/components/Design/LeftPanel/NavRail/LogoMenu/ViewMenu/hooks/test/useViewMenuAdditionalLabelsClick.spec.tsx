import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ReactNode } from 'react';

// hooks
import { useViewMenuAdditionalLabelsClick } from '../useViewMenuAdditionalLabelsClick';

// store
import { selectAreAdditionalLabelsVisible } from 'store/design/selectors';
import { store } from 'store';
import { toggleAdditionalLabels } from 'store/design/slice';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

describe('useViewMenuAdditionalLabelsClick', () => {
  beforeEach(() => {
    if (!selectAreAdditionalLabelsVisible(store.getState())) {
      store.dispatch(toggleAdditionalLabels());
    }
  });

  it('should toggle the additional labels visibility flag when called', () => {
    // before
    const { result } = renderHook(() => useViewMenuAdditionalLabelsClick(), { wrapper });

    // action
    result.current();

    // result
    expect(selectAreAdditionalLabelsVisible(store.getState())).toBe(false);
  });
});
