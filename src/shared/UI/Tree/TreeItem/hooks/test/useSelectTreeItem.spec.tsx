import { Provider } from 'react-redux';
import { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';

// hooks
import { useSelectTreeItem } from '../useSelectTreeItem';

// store
import { selectSelectedIds } from 'store/design/selectors';
import { setSelection } from 'store/design/slice';
import { store } from 'store';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

describe('useSelectTreeItem', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should dispatch setSelection with the given id when called', () => {
    // before
    const { result } = renderHook(() => useSelectTreeItem('node-1'), { wrapper });

    // action
    result.current();

    // result
    expect(selectSelectedIds(store.getState())).toEqual(['node-1']);
  });
});
