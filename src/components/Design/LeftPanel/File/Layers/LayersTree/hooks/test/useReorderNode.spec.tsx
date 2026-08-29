import { Provider } from 'react-redux';
import { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';

// hooks
import { useReorderNode } from '../useReorderNode';

// store
import { addNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

describe('useReorderNode', () => {
  it('should dispatch reorderNode with the given from/to indexes', () => {
    // mock — append two fresh nodes so their positions are known regardless of pre-existing rootOrder
    store.dispatch(
      addNode({ fill: '#ff0000', height: 10, name: 'A', parentId: null, rotation: 0, type: NodeType.frame, width: 10, x: 0, y: 0 }),
    );
    store.dispatch(
      addNode({ fill: '#ff0000', height: 10, name: 'B', parentId: null, rotation: 0, type: NodeType.frame, width: 10, x: 0, y: 0 }),
    );

    const rootOrderBefore = selectActivePage(store.getState()).rootOrder;
    const [firstId, secondId] = rootOrderBefore.slice(-2);
    const fromIndex = rootOrderBefore.length - 2;
    const toIndex = rootOrderBefore.length - 1;

    // before
    const { result } = renderHook(() => useReorderNode(), { wrapper });

    // action
    result.current([fromIndex], toIndex);

    // result
    const rootOrderAfter = selectActivePage(store.getState()).rootOrder;
    expect(rootOrderAfter[fromIndex]).toBe(secondId);
    expect(rootOrderAfter[toIndex]).toBe(firstId);
  });

  it('should dispatch reorderNode with multiple from-indices, moving the whole group together', () => {
    // mock
    store.dispatch(
      addNode({ fill: '#ff0000', height: 10, name: 'C', parentId: null, rotation: 0, type: NodeType.frame, width: 10, x: 0, y: 0 }),
    );
    store.dispatch(
      addNode({ fill: '#ff0000', height: 10, name: 'D', parentId: null, rotation: 0, type: NodeType.frame, width: 10, x: 0, y: 0 }),
    );
    store.dispatch(
      addNode({ fill: '#ff0000', height: 10, name: 'E', parentId: null, rotation: 0, type: NodeType.frame, width: 10, x: 0, y: 0 }),
    );

    const rootOrderBefore = selectActivePage(store.getState()).rootOrder;
    const [firstId, secondId] = rootOrderBefore.slice(-3);
    const fromIndices = [rootOrderBefore.length - 3, rootOrderBefore.length - 2];
    const toIndex = rootOrderBefore.length;

    // before
    const { result } = renderHook(() => useReorderNode(), { wrapper });

    // action
    result.current(fromIndices, toIndex);

    // result
    const rootOrderAfter = selectActivePage(store.getState()).rootOrder;
    expect(rootOrderAfter.slice(-2)).toEqual([firstId, secondId]);
  });
});
