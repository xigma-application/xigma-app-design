import { Provider } from 'react-redux';
import { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';

// hooks
import { useReorderPages } from '../useReorderPages';

// store
import { addPage } from 'store/design/slice';
import { selectPages } from 'store/design/selectors';
import { store } from 'store';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

describe('useReorderPages', () => {
  it('should dispatch reorderPages with the given from/to indexes', () => {
    // mock — append two fresh pages so their positions are known regardless of pre-existing page order
    store.dispatch(addPage());
    store.dispatch(addPage());

    const pagesBefore = Object.keys(selectPages(store.getState()));
    const [secondToLastId, lastId] = pagesBefore.slice(-2);
    const fromIndex = pagesBefore.length - 2;
    const toIndex = pagesBefore.length - 1;

    // before
    const { result } = renderHook(() => useReorderPages(), { wrapper });

    // action
    result.current(fromIndex, toIndex);

    // result
    const pagesAfter = Object.keys(selectPages(store.getState()));
    expect(pagesAfter[fromIndex]).toBe(lastId);
    expect(pagesAfter[toIndex]).toBe(secondToLastId);
  });
});
