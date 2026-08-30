import { Provider } from 'react-redux';
import { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';

// hooks
import { useIsRowHighlighted } from '../useIsRowHighlighted';

// store
import { addNode, deleteNode, groupNodes, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

describe('useIsRowHighlighted', () => {
  let idA: string;
  let idB: string;
  let groupId: string;

  beforeEach(() => {
    store.dispatch(
      addNode({ fill: '#ff0000', height: 10, name: 'Frame A', parentId: null, rotation: 0, type: NodeType.frame, width: 10, x: 0, y: 0 }),
    );
    store.dispatch(
      addNode({ fill: '#ff0000', height: 10, name: 'Frame B', parentId: null, rotation: 0, type: NodeType.frame, width: 10, x: 0, y: 0 }),
    );
    [idA, idB] = selectActivePage(store.getState()).rootOrder.slice(-2);
    store.dispatch(setSelection([idA, idB]));
    store.dispatch(groupNodes());
    [groupId] = selectActivePage(store.getState()).selectedIds;
  });

  afterEach(() => {
    store.dispatch(deleteNode(groupId));
    store.dispatch(setSelection([]));
  });

  it('should report true for a node whose ancestor group is selected', () => {
    // before
    const { result } = renderHook(() => useIsRowHighlighted(), { wrapper });
    const nodes = selectActivePage(store.getState()).nodes;

    // result
    expect(result.current(nodes[idA])).toBe(true);
    expect(result.current(nodes[idB])).toBe(true);
  });

  it('should report false for the selected group itself and for unrelated nodes', () => {
    // before
    const { result } = renderHook(() => useIsRowHighlighted(), { wrapper });
    const nodes = selectActivePage(store.getState()).nodes;

    // result
    expect(result.current(nodes[groupId])).toBe(false);
    expect(result.current({ ...nodes[idA], id: 'unrelated' })).toBe(false);
  });
});
