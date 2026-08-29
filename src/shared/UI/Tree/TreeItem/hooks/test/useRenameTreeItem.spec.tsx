import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { renderHook } from '@testing-library/react';

// hooks
import { useRenameTreeItem } from '../useRenameTreeItem';

// store
import { addNode, deleteNode } from 'store/design/slice';
import { selectNodes } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

describe('useRenameTreeItem', () => {
  let nodeId: string;

  beforeEach(() => {
    store.dispatch(
      addNode({
        fill: '#ff0000',
        height: 10,
        name: 'Frame',
        parentId: null,
        rotation: 0,
        type: NodeType.frame,
        width: 10,
        x: 0,
        y: 0,
      }),
    );
    nodeId = Object.keys(selectNodes(store.getState())).at(-1) as string;
  });

  afterEach(() => {
    store.dispatch(deleteNode(nodeId));
  });

  it('should update the node name when the returned callback is called', () => {
    // before
    const { result } = renderHook(() => useRenameTreeItem(nodeId), { wrapper });

    // action
    result.current('Renamed');

    // result
    expect(selectNodes(store.getState())[nodeId].name).toBe('Renamed');
  });
});
