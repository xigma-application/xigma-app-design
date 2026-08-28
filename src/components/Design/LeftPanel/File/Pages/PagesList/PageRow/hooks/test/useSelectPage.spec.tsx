import { Provider } from 'react-redux';
import { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';

// hooks
import { useSelectPage } from '../useSelectPage';

// store
import { setActivePage } from 'store/design/slice';
import { selectActivePageId } from 'store/design/selectors';
import { store } from 'store';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

describe('useSelectPage', () => {
  const initialActivePageId = selectActivePageId(store.getState());

  afterEach(() => {
    store.dispatch(setActivePage(initialActivePageId));
  });

  it('should dispatch setActivePage with the given id when called', () => {
    // before
    const { result } = renderHook(() => useSelectPage('other-page'), { wrapper });

    // action
    result.current();

    // result
    expect(selectActivePageId(store.getState())).toBe('other-page');
  });
});
