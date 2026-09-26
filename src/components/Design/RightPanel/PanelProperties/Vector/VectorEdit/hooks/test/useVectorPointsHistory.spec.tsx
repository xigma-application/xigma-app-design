import { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';

// core
import CanvasRefsProvider from 'components/App/core/CanvasRefsProvider/CanvasRefsProvider';

// hooks
import { useVectorPointsHistory } from '../useVectorPointsHistory';

// store
import { addNodes, setSelection, setVectorEditingNodeIds, updateNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';
import { undo } from 'store/history/actions';

// types
import { TVectorNode } from 'types/design/types';

// utils
import { makeNetworkVector } from 'utils/canvas/vector/stroke/test/fixtures';
import { useCanvasRefsContext } from 'components/App/core/CanvasRefsProvider/hooks/useCanvasRefsContext';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => (
  <Provider store={store}>
    <CanvasRefsProvider>{children}</CanvasRefsProvider>
  </Provider>
);

const twoSquares = makeNetworkVector(
  {
    a1: { x: 0, y: 0 },
    a2: { x: 10, y: 0 },
    a3: { x: 10, y: 10 },
    a4: { x: 0, y: 10 },
    b1: { x: 30, y: 20 },
    b2: { x: 50, y: 20 },
    b3: { x: 50, y: 40 },
    b4: { x: 30, y: 40 },
  },
  [
    ['a1', 'a2'],
    ['a2', 'a3'],
    ['a3', 'a4'],
    ['a4', 'a1'],
    ['b1', 'b2'],
    ['b2', 'b3'],
    ['b3', 'b4'],
    ['b4', 'b1'],
  ],
);

const readVector = (): TVectorNode => selectActivePage(store.getState()).nodes['edit-vector'] as TVectorNode;

const editVector = (vector: Partial<TVectorNode> = {}): void => {
  store.dispatch(addNodes({ nodes: [{ ...twoSquares, ...vector, id: 'edit-vector' }], rootIds: ['edit-vector'] }));
  store.dispatch(setSelection(['edit-vector']));
  store.dispatch(setVectorEditingNodeIds(['edit-vector']));
};

describe('useVectorPointsHistory', () => {
  it('should record a change as one undo step and drop the cached multi select box', () => {
    // mock
    editVector();

    // before
    const { result } = renderHook(() => ({ history: useVectorPointsHistory(), refs: useCanvasRefsContext() }), { wrapper });

    result.current.refs.vectorMultiSelect.vectorMultiSelectBoxRef.current = {
      bounds: { height: 1, width: 1, x: 0, y: 0 },
      rotation: 0,
      selectionKey: 'key',
    };

    // action
    act(() => {
      result.current.history.run(() => {
        store.dispatch(updateNode({ changes: { cornerRadius: 3 }, id: 'edit-vector' }));
        store.dispatch(updateNode({ changes: { cornerRadius: 6 }, id: 'edit-vector' }));
      });
    });

    // result
    expect(readVector().cornerRadius).toBe(6);
    expect(result.current.refs.vectorMultiSelect.vectorMultiSelectBoxRef.current).toBeNull();

    // action
    act(() => {
      store.dispatch(undo({ selectedVectorHandles: [], selectedVectorSegmentIds: [], selectedVectorVertexIds: [] }));
    });

    // result
    expect(readVector().cornerRadius).toBeUndefined();
  });
});
