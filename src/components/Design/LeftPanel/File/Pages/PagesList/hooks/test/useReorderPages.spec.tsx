import { Provider } from 'react-redux';
import { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';

// hooks
import { useReorderPages } from '../useReorderPages';

// store
import { addPage } from 'store/design/slice';
import { selectPages } from 'store/design/selectors';
import { store } from 'store';

// types
import { TDesignPage } from 'store/design/types';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const buildPage = (overrides: Partial<TDesignPage>): TDesignPage => ({
  backgroundPaint: { color: '#d9d9d9', opacity: 100, type: 'solid' },
  comments: {},
  guides: [],
  id: 'page-1',
  name: 'Page',
  nodes: {},
  paint: { color: '#d9d9d9', opacity: 100, type: 'solid' },
  rootOrder: [],
  selectedIds: [],
  viewport: { x: 0, y: 0, zoom: 1 },
  ...overrides,
});

describe('useReorderPages', () => {
  it('should dispatch reorderPages with the dragged page and target index', () => {
    // mock — append two fresh pages so their positions are known regardless of pre-existing page order
    store.dispatch(addPage());
    store.dispatch(addPage());

    const pagesBefore = selectPages(store.getState());
    const idsBefore = Object.keys(pagesBefore);
    const [secondToLastId, lastId] = idsBefore.slice(-2);
    const fromIndex = idsBefore.length - 2;
    const toIndex = idsBefore.length - 1;

    // before
    const { result } = renderHook(() => useReorderPages(), { wrapper });

    // action
    result.current([pagesBefore[secondToLastId]], null, toIndex);

    // result
    const idsAfter = Object.keys(selectPages(store.getState()));
    expect(idsAfter[fromIndex]).toBe(lastId);
    expect(idsAfter[toIndex]).toBe(secondToLastId);
  });

  it('should no-op when called with an empty dragged-items array', () => {
    // mock
    const idsBefore = Object.keys(selectPages(store.getState()));

    // before
    const { result } = renderHook(() => useReorderPages(), { wrapper });

    // action
    result.current([], null, 0);

    // result
    expect(Object.keys(selectPages(store.getState()))).toEqual(idsBefore);
  });

  it('should no-op when the dragged page no longer exists in the current page order', () => {
    // mock
    const idsBefore = Object.keys(selectPages(store.getState()));

    // before
    const { result } = renderHook(() => useReorderPages(), { wrapper });

    // action
    result.current([buildPage({ id: 'missing' })], null, 0);

    // result
    expect(Object.keys(selectPages(store.getState()))).toEqual(idsBefore);
  });
});
