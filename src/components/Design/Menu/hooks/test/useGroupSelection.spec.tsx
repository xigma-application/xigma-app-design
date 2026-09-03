import { Provider } from 'react-redux';
import { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';

// hooks
import { useGroupSelection } from '../useGroupSelection';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

describe('useGroupSelection', () => {
  it('should group the selected nodes into a group node when called', () => {
    // mock
    store.dispatch(
      addNode({ fill: '#ff0000', height: 10, name: 'A', parentId: null, rotation: 0, childIds: [], clipContent: true, type: NodeType.frame, width: 10, x: 0, y: 0 }),
    );
    store.dispatch(
      addNode({ fill: '#ff0000', height: 10, name: 'B', parentId: null, rotation: 0, childIds: [], clipContent: true, type: NodeType.frame, width: 10, x: 0, y: 0 }),
    );
    const [idA, idB] = selectActivePage(store.getState()).rootOrder.slice(-2);
    store.dispatch(setSelection([idA, idB]));

    // before
    const { result } = renderHook(() => useGroupSelection(), { wrapper });

    // action
    result.current();

    // result
    const page = selectActivePage(store.getState());
    const [groupId] = page.selectedIds;
    expect(page.nodes[groupId].type).toBe(NodeType.group);
  });
});
