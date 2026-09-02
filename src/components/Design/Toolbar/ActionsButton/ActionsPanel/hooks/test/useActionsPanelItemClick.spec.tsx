import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';

// core
import CanvasRefsProvider from 'components/App/core/CanvasRefsProvider/CanvasRefsProvider';

// hooks
import { useActionsPanelItemClick } from '../useActionsPanelItemClick';

// store
import { addNode, setSelection } from 'store/design/slice';
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';
import { selectActivePage, selectSelectedIds } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

const wrapper = ({ children }: { children: React.ReactNode }): React.ReactNode => (
  <Provider store={store}>
    <CanvasRefsProvider>{children}</CanvasRefsProvider>
  </Provider>
);

describe('useActionsPanelItemClick', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should select every node on the page for the "selectAll" action', () => {
    // mock
    store.dispatch(
      addNode({
        fill: '#ff0000',
        height: 10,
        name: 'Rectangle',
        parentId: null,
        rotation: 0,
        type: NodeType.rectangle,
        width: 10,
        x: 0,
        y: 0,
      }),
    );

    const { result } = renderHook(() => useActionsPanelItemClick(), { wrapper });

    // action
    act(() => result.current('selectAll'));

    // result
    expect(selectSelectedIds(store.getState())).toEqual(selectActivePage(store.getState()).rootOrder);
  });

  it('should undo the last change for the "undo" action', () => {
    // mock
    store.dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
    store.dispatch(
      addNode({
        fill: '#ff0000',
        height: 10,
        name: 'Rectangle',
        parentId: null,
        rotation: 0,
        type: NodeType.rectangle,
        width: 10,
        x: 0,
        y: 0,
      }),
    );
    store.dispatch(endHistoryGesture());

    const { rootOrder } = selectActivePage(store.getState());
    const nodeId = rootOrder[rootOrder.length - 1];

    const { result } = renderHook(() => useActionsPanelItemClick(), { wrapper });

    // action
    act(() => result.current('undo'));

    // result
    expect(selectActivePage(store.getState()).nodes[nodeId]).toBeUndefined();
  });

  it('should do nothing for an undefined action', () => {
    // before
    const { result } = renderHook(() => useActionsPanelItemClick(), { wrapper });

    // action
    expect(() => act(() => result.current(undefined))).not.toThrow();

    // result
    expect(selectSelectedIds(store.getState())).toEqual([]);
  });
});
