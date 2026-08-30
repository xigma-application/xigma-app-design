import { Provider } from 'react-redux';
import { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';

// hooks
import { useTreeSource } from '../useTreeSource';

// store
import { addNode, deleteNode, groupNodes, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

describe('useTreeSource', () => {
  let idA: string;
  let idB: string;

  beforeEach(() => {
    store.dispatch(
      addNode({ fill: '#ff0000', height: 10, name: 'Frame A', parentId: null, rotation: 0, type: NodeType.frame, width: 10, x: 0, y: 0 }),
    );
    store.dispatch(
      addNode({ fill: '#ff0000', height: 10, name: 'Frame B', parentId: null, rotation: 0, type: NodeType.frame, width: 10, x: 0, y: 0 }),
    );
    [idA, idB] = selectActivePage(store.getState()).rootOrder.slice(-2);
  });

  afterEach(() => {
    store.dispatch(deleteNode(idA));
    store.dispatch(deleteNode(idB));
    store.dispatch(setSelection([]));
  });

  it('should return the active page rootOrder nodes as roots', () => {
    // before
    const { result } = renderHook(() => useTreeSource(), { wrapper });

    // result
    expect(result.current.roots.map((node) => node.id)).toEqual(expect.arrayContaining([idA, idB]));
  });

  it("should return a group's children for a group node", () => {
    // mock
    store.dispatch(setSelection([idA, idB]));
    store.dispatch(groupNodes());
    const [groupId] = selectActivePage(store.getState()).selectedIds;

    // before
    const { result } = renderHook(() => useTreeSource(), { wrapper });
    const groupNode = selectActivePage(store.getState()).nodes[groupId];

    // result
    expect(result.current.getChildren(groupNode)?.map((node) => node.id)).toEqual([idA, idB]);
  });

  it('should return undefined for a non-group node, since it has no expandable children', () => {
    // before
    const { result } = renderHook(() => useTreeSource(), { wrapper });
    const node = selectActivePage(store.getState()).nodes[idA];

    // result
    expect(result.current.getChildren(node)).toBeUndefined();
  });
});
