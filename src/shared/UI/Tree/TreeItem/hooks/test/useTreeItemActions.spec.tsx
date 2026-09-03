import { MouseEvent, ReactNode } from 'react';
import { Provider } from 'react-redux';
import { renderHook } from '@testing-library/react';

// hooks
import { useTreeItemActions } from '../useTreeItemActions';

// store
import { addNode, deleteNode } from 'store/design/slice';
import { selectNodes } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

describe('useTreeItemActions', () => {
  let nodeId: string;

  beforeEach(() => {
    store.dispatch(
      addNode({
        childIds: [],
        clipContent: true,
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

  it('should toggle the node locked state when handleToggleLocked is called', () => {
    // before
    const { result } = renderHook(() => useTreeItemActions(nodeId), { wrapper });

    // action
    result.current.handleToggleLocked();

    // result
    expect(selectNodes(store.getState())[nodeId].locked).toBe(true);
  });

  it('should toggle the node hidden state when handleToggleHidden is called', () => {
    // before
    const { result } = renderHook(() => useTreeItemActions(nodeId), { wrapper });

    // action
    result.current.handleToggleHidden();

    // result
    expect(selectNodes(store.getState())[nodeId].hidden).toBe(true);
  });

  it('should stop propagation on handleStopPropagation', () => {
    // before
    const { result } = renderHook(() => useTreeItemActions(nodeId), { wrapper });
    const stopPropagation = vi.fn();

    // action
    result.current.handleStopPropagation({ stopPropagation } as unknown as MouseEvent<HTMLElement>);

    // result
    expect(stopPropagation).toHaveBeenCalledTimes(1);
  });
});
