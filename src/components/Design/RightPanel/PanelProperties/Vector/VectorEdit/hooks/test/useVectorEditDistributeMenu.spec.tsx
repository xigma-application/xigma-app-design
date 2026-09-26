import { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';

// core
import CanvasRefsProvider from 'components/App/core/CanvasRefsProvider/CanvasRefsProvider';

// hooks
import { useVectorEditDistributeMenu } from '../useVectorEditDistributeMenu';

// store
import { addNodes, setSelection, setVectorEditingNodeIds, setVectorPointSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
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

const readVector = (): TVectorNode => selectActivePage(store.getState()).nodes['edit-vector'] as TVectorNode;

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

const threePieces = {
  segments: {
    ...twoSquares.segments,
    c: { endId: 'c2', id: 'c', startId: 'c1', tangentEnd: null, tangentStart: null },
  },
  vertices: {
    ...twoSquares.vertices,
    c1: { id: 'c1', x: 100, y: 3 },
    c2: { id: 'c2', x: 110, y: 3 },
  },
};

describe('useVectorEditDistributeMenu', () => {
  it('should disable every action with fewer than two groups', () => {
    // mock
    editVector();

    // before
    const { result } = renderHook(() => useVectorEditDistributeMenu(), { wrapper });

    // result
    expect(result.current.enabledActions).toEqual({ horizontal: false, tidyUp: false, vertical: false });
    expect(result.current.triggerIcon).toBe('DistributeVerticalSpacing');
    expect(result.current.tidyUpIcon).toBe('TidyUpVertical');
  });

  it('should distribute and tidy up three groups', () => {
    // mock
    editVector(threePieces);

    // before
    const { result } = renderHook(() => useVectorEditDistributeMenu(), { wrapper });

    selectPoints(['a1', 'a2', 'b1', 'b2', 'c1', 'c2']);

    // result
    expect(result.current.enabledActions).toEqual({ horizontal: true, tidyUp: true, vertical: true });

    // action
    act(() => {
      result.current.onAction('horizontal');
    });

    // result — the middle group lands halfway between the outer ones
    expect(readVector().vertices.b1.x).toBe(45);

    // action
    act(() => {
      result.current.onAction('tidyUp');
    });

    // result
    expect(readVector().vertices.a1).toEqual({ id: 'a1', x: 0, y: 0 });
  });
});
