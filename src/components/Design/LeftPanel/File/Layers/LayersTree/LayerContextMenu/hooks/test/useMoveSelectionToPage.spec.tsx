import { Provider } from 'react-redux';
import { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';

// hooks
import { useMoveSelectionToPage } from '../useMoveSelectionToPage';

// store
import { addNode, addPage, setActivePage, setSelection } from 'store/design/slice';
import { selectActivePage, selectActivePageId } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

describe('useMoveSelectionToPage', () => {
  it('should move the currently selected nodes to the target page', () => {
    // mock — a node on the first page, plus a second page to move it to
    store.dispatch(
      addNode({ fill: '#ff0000', height: 10, name: 'A', parentId: null, rotation: 0, type: NodeType.frame, width: 10, x: 0, y: 0 }),
    );

    const firstPageId = selectActivePageId(store.getState());
    const [idA] = selectActivePage(store.getState()).rootOrder.slice(-1);

    store.dispatch(setSelection([idA]));
    store.dispatch(addPage());

    const secondPageId = selectActivePageId(store.getState());

    store.dispatch(setActivePage(firstPageId));

    // before
    const { result } = renderHook(() => useMoveSelectionToPage(), { wrapper });

    // action
    result.current(secondPageId);

    // result
    expect(store.getState().design.pages[firstPageId].nodes[idA]).toBeUndefined();
    expect(store.getState().design.pages[secondPageId].nodes[idA]).toBeDefined();
  });

  it('should do nothing when there is no selection', () => {
    // mock
    store.dispatch(setSelection([]));
    store.dispatch(addPage());

    const targetPageId = selectActivePageId(store.getState());
    const nodesBefore = { ...store.getState().design.pages[targetPageId].nodes };

    // before
    const { result } = renderHook(() => useMoveSelectionToPage(), { wrapper });

    // action
    result.current(targetPageId);

    // result
    expect(store.getState().design.pages[targetPageId].nodes).toEqual(nodesBefore);
  });
});
