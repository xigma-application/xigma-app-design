import { Provider } from 'react-redux';
import { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';

// hooks
import { useHandleRemoveMask } from '../useHandleRemoveMask';

// store
import { addNode, moveNodes } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TMaskNode, TRectangleNode } from 'types/design/types';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

describe('useHandleRemoveMask', () => {
  it('should call onRemoveMask for a non-mask node (the masked child case)', () => {
    // mock
    const onRemoveMask = vi.fn();
    const node: TRectangleNode = {
      fill: '#ff0000',
      height: 10,
      id: 'rect-1',
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: 10,
      x: 0,
      y: 0,
    };

    // before
    const { result } = renderHook(() => useHandleRemoveMask(node, onRemoveMask), { wrapper });

    // action
    result.current();

    // result
    expect(onRemoveMask).toHaveBeenCalledTimes(1);
  });

  it('should ungroup the container entirely for a mask node, without calling onRemoveMask', () => {
    // mock — a real mask container with a real child, so the ungroup dispatch has something to release
    store.dispatch(
      addNode({ childIds: [], height: 20, name: 'Mask group', parentId: null, rotation: 0, type: NodeType.mask, width: 20, x: 0, y: 0 }),
    );
    const maskId = selectActivePage(store.getState()).rootOrder.slice(-1)[0];

    store.dispatch(
      addNode({
        fill: '#ff0000',
        height: 10,
        name: 'Rectangle',
        parentId: null,
        rotation: 0,
        type: NodeType.rectangle,
        width: 10,
        x: 0,
        y: 0,
      }),
    );
    const childId = selectActivePage(store.getState()).rootOrder.slice(-1)[0];

    store.dispatch(moveNodes({ nodeIds: [childId], targetIndex: 0, targetParentId: maskId }));

    const maskNode = selectActivePage(store.getState()).nodes[maskId] as TMaskNode;
    const onRemoveMask = vi.fn();

    // before
    const { result } = renderHook(() => useHandleRemoveMask(maskNode, onRemoveMask), { wrapper });

    // action
    result.current();

    // result — the container is gone, its child released, and the child-specific handler untouched
    const page = selectActivePage(store.getState());
    expect(page.nodes[maskId]).toBeUndefined();
    expect(page.nodes[childId].parentId).toBeNull();
    expect(onRemoveMask).not.toHaveBeenCalled();
  });
});
