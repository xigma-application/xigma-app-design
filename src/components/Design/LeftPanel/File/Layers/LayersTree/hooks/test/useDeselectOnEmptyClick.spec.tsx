import { Provider } from 'react-redux';
import { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';

// hooks
import { useDeselectOnEmptyClick } from '../useDeselectOnEmptyClick';

// store
import { selectSelectedIds } from 'store/design/selectors';
import { setSelection } from 'store/design/slice';
import { store } from 'store';

// utils
import { getSelectionAnchorId, setSelectionAnchorId } from 'shared/UI/Tree/TreeItem/hooks/useSelectTreeItem/utils/selectionAnchor';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

describe('useDeselectOnEmptyClick', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
    setSelectionAnchorId(null);
  });

  it('should clear the current selection when called', () => {
    // before
    store.dispatch(setSelection(['node-1']));
    const { result } = renderHook(() => useDeselectOnEmptyClick(), { wrapper });

    // action
    result.current();

    // result
    expect(selectSelectedIds(store.getState())).toEqual([]);
  });

  it('should clear the shift-range anchor when called, so a later shift-click does not range from a stale one', () => {
    // before
    setSelectionAnchorId('node-1');
    const { result } = renderHook(() => useDeselectOnEmptyClick(), { wrapper });

    // action
    result.current();

    // result
    expect(getSelectionAnchorId()).toBeNull();
  });
});
