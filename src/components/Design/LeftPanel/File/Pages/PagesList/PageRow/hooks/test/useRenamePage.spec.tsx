import { Provider } from 'react-redux';
import { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';

// hooks
import { useRenamePage } from '../useRenamePage';

// store
import { renamePage } from 'store/design/slice';
import { selectActivePageId, selectPages } from 'store/design/selectors';
import { store } from 'store';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

describe('useRenamePage', () => {
  const activePageId = selectActivePageId(store.getState());
  const originalName = selectPages(store.getState())[activePageId].name;

  afterEach(() => {
    store.dispatch(renamePage({ id: activePageId, name: originalName }));
  });

  it('should dispatch renamePage with the given id when called', () => {
    // before
    const { result } = renderHook(() => useRenamePage(activePageId), { wrapper });

    // action
    result.current('Renamed page');

    // result
    expect(selectPages(store.getState())[activePageId].name).toBe('Renamed page');
  });
});
