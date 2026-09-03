import { Provider } from 'react-redux';
import { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';

// hooks
import { useUseSelectionAsMask } from '../useUseSelectionAsMask';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

describe('useUseSelectionAsMask', () => {
  it('should wrap the selected nodes into a mask group when called', () => {
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

    // before
    const { result } = renderHook(() => useUseSelectionAsMask(), { wrapper });

    // action
    result.current();

    // result
    const page = selectActivePage(store.getState());
    const [groupId] = page.selectedIds;
    expect(page.nodes[groupId].type).toBe(NodeType.group);
    expect(page.nodes[groupId].name).toBe('Mask group');
    expect(page.nodes[(page.nodes[groupId] as { childIds: string[] }).childIds.at(-1)!].isMask).toBe(true);
  });
});
