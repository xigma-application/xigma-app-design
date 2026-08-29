import { MemoryRouter } from 'react-router';
import { Provider } from 'react-redux';
import { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';

// hooks
import { useSyncActivePageFromUrl } from '../useSyncActivePageFromUrl';

// store
import { addPage, deletePage, setActivePage } from 'store/design/slice';
import { selectActivePageId, selectPages } from 'store/design/selectors';
import { store } from 'store';

const renderSync = (entry: string): void => {
  const wrapper = ({ children }: { children: ReactNode }): ReactNode => (
    <Provider store={store}>
      <MemoryRouter initialEntries={[entry]}>{children}</MemoryRouter>
    </Provider>
  );

  renderHook(() => useSyncActivePageFromUrl(), { wrapper });
};

describe('useSyncActivePageFromUrl', () => {
  const initialActivePageId = selectActivePageId(store.getState());

  afterEach(() => {
    Object.keys(selectPages(store.getState()))
      .filter((pageId) => pageId !== initialActivePageId)
      .forEach((pageId) => store.dispatch(deletePage(pageId)));
    store.dispatch(setActivePage(initialActivePageId));
  });

  it('should activate the page referenced by the ?page= query param', () => {
    // mock
    store.dispatch(addPage());
    const secondId = selectActivePageId(store.getState());
    store.dispatch(setActivePage(initialActivePageId));

    // before
    renderSync(`/design/file-1?page=${secondId}`);

    // result
    expect(selectActivePageId(store.getState())).toBe(secondId);
  });

  it('should ignore a ?page= that does not match any page', () => {
    // before
    renderSync('/design/file-1?page=nope');

    // result
    expect(selectActivePageId(store.getState())).toBe(initialActivePageId);
  });

  it('should do nothing when there is no ?page= param', () => {
    // before
    renderSync('/design/file-1');

    // result
    expect(selectActivePageId(store.getState())).toBe(initialActivePageId);
  });
});
