import { Provider } from 'react-redux';
import { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';

// hooks
import { useHandleReorder } from '../useHandleReorder';

// store
import { addNode, deleteNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

describe('useHandleReorder', () => {
  let idA: string;
  let idB: string;

  beforeEach(() => {
    store.dispatch(
      addNode({ fill: '#ff0000', height: 10, name: 'A', parentId: null, rotation: 0, childIds: [], clipContent: true, type: NodeType.frame, width: 10, x: 0, y: 0 }),
    );
    store.dispatch(
      addNode({ fill: '#ff0000', height: 10, name: 'B', parentId: null, rotation: 0, childIds: [], clipContent: true, type: NodeType.frame, width: 10, x: 0, y: 0 }),
    );
    [idA, idB] = selectActivePage(store.getState()).rootOrder.slice(-2);
  });

  afterEach(() => {
    store.dispatch(deleteNode(idA));
    store.dispatch(deleteNode(idB));
  });

  it('should dispatch moveNodes built from the dragged items, target parent and target index', () => {
    // mock
    const { nodes } = selectActivePage(store.getState());

    // before
    const { result } = renderHook(() => useHandleReorder(), { wrapper });

    // action — move A to become a child of B
    result.current([nodes[idA]], nodes[idB], 0);

    // result
    expect(selectActivePage(store.getState()).nodes[idA].parentId).toBe(idB);
  });

  it('should move a node back to the top level when the target parent is null', () => {
    // mock
    const { nodes } = selectActivePage(store.getState());

    // before
    const { result } = renderHook(() => useHandleReorder(), { wrapper });
    result.current([nodes[idA]], nodes[idB], 0);

    // action
    result.current([selectActivePage(store.getState()).nodes[idA]], null, 0);

    // result
    expect(selectActivePage(store.getState()).nodes[idA].parentId).toBeNull();
  });
});
