import { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';

// core
import CanvasRefsProvider from 'components/App/core/CanvasRefsProvider/CanvasRefsProvider';

// hooks
import { useVectorPointGroups } from '../useVectorPointGroups';

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

describe('useVectorPointGroups', () => {
  it('should return no groups while no vector is edited', () => {
    // before
    const { result } = renderHook(() => useVectorPointGroups(), { wrapper });

    // result
    expect(result.current).toEqual({ groups: [], node: undefined });
  });

  it('should group the selected points by their connected piece', () => {
    // mock
    editVector();

    // before
    const { result } = renderHook(() => useVectorPointGroups(), { wrapper });

    // action
    selectPoints(['a1', 'b1', 'b2']);

    // result
    expect(result.current.groups.map(({ vertexIds }) => vertexIds)).toEqual([['a1'], ['b1', 'b2']]);
  });
});
