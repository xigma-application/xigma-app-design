import { Provider } from 'react-redux';
import { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';

// hooks
import { useDeletePage } from '../useDeletePage';

// store
import { addPage, setActivePage } from 'store/design/slice';
import { selectActivePageId, selectPages } from 'store/design/selectors';
import { store } from 'store';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

describe('useDeletePage', () => {
  const initialActivePageId = selectActivePageId(store.getState());

  afterEach(() => {
    store.dispatch(setActivePage(initialActivePageId));
  });

  it('should dispatch deletePage with the given id when called', () => {
    // before
    store.dispatch(addPage());
    const addedId = selectActivePageId(store.getState());
    const { result } = renderHook(() => useDeletePage(addedId), { wrapper });

    // action
    result.current();

    // result
    expect(selectPages(store.getState())[addedId]).toBeUndefined();
  });
});
