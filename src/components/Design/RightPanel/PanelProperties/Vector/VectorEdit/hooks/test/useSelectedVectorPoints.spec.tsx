import { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';

// core
import CanvasRefsProvider from 'components/App/core/CanvasRefsProvider/CanvasRefsProvider';

// hooks
import { useSelectedVectorPoints } from '../useSelectedVectorPoints';

// store
import { addNodes, setSelection, setVectorEditingNodeIds, setVectorPointSelection } from 'store/design/slice';
import { store } from 'store';

// types
import { TVectorNode } from 'types/design/types';

// utils
import { makeNetworkVector } from 'utils/canvas/vector/stroke/test/fixtures';

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

const editVector = (vector: Partial<TVectorNode> = {}): void => {
  store.dispatch(addNodes({ nodes: [{ ...twoSquares, ...vector, id: 'edit-vector' }], rootIds: ['edit-vector'] }));
  store.dispatch(setSelection(['edit-vector']));
  store.dispatch(setVectorEditingNodeIds(['edit-vector']));
};

const selectPoints = (vertexIds: string[], segmentIds: string[] = []): void => {
  act(() => {
    store.dispatch(setVectorPointSelection({ segmentIds, vertexIds }));
  });
};

describe('useSelectedVectorPoints', () => {
  it('should return nothing while no vector is in vector edit mode', () => {
    // before
    const { result } = renderHook(() => useSelectedVectorPoints(), { wrapper });

    // result
    expect(result.current).toEqual({ node: undefined, vertexIds: [] });
  });

  it('should return the edited vector and its selected points with the ends of its selected segments', () => {
    // mock
    editVector();

    // before
    const { result } = renderHook(() => useSelectedVectorPoints(), { wrapper });

    // action
    selectPoints(['b1'], ['s0']);

    // result
    expect(result.current.node?.id).toBe('edit-vector');
    expect(result.current.vertexIds).toEqual(['b1', 'a1', 'a2']);
  });
});
