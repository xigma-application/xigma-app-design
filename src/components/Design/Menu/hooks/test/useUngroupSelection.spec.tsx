import { Provider } from 'react-redux';
import { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';

// hooks
import { useUngroupSelection } from '../useUngroupSelection';

// store
import { addNode, groupNodes, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

describe('useUngroupSelection', () => {
  it('should ungroup the selected group node into its own children when called', () => {
    // mock
    store.dispatch(
      addNode({
        childIds: [],
        clipContent: true,
        fill: '#ff0000',
        height: 10,
        name: 'A',
        parentId: null,
        rotation: 0,
        type: NodeType.frame,
        width: 10,
        x: 0,
        y: 0,
      }),
    );
    store.dispatch(
      addNode({
        childIds: [],
        clipContent: true,
        fill: '#ff0000',
        height: 10,
        name: 'B',
        parentId: null,
        rotation: 0,
        type: NodeType.frame,
        width: 10,
        x: 0,
        y: 0,
      }),
    );
    const [idA, idB] = selectActivePage(store.getState()).rootOrder.slice(-2);
    store.dispatch(setSelection([idA, idB]));
    store.dispatch(groupNodes());

    // before
    const { result } = renderHook(() => useUngroupSelection(), { wrapper });

    // action
    result.current();

    // result
    const page = selectActivePage(store.getState());
    expect(page.selectedIds).toEqual(expect.arrayContaining([idA, idB]));
    expect(page.nodes[idA]?.parentId).toBeNull();
    expect(page.nodes[idB]?.parentId).toBeNull();
  });
});
