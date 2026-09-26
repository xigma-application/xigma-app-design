import { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';

// core
import CanvasRefsProvider from 'components/App/core/CanvasRefsProvider/CanvasRefsProvider';

// hooks
import { useVectorEditAlignment } from '../useVectorEditAlignment';

// store
import { addNodes, setSelection, setVectorEditingNodeIds, setVectorPointSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { TVectorNode } from 'types/design/types';
import { AlignmentHorizontal, AlignmentVertical } from 'types/design/enums';

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
    store.dispatch(setVectorPointSelection({ handles: [], segmentIds, vertexIds }));
  });
};

describe('useVectorEditAlignment', () => {
  it('should be disabled while the selected points belong to one piece', () => {
    // mock
    editVector();

    // before
    const { result } = renderHook(() => useVectorEditAlignment(), { wrapper });

    // action
    selectPoints(['a1', 'a2', 'a3', 'a4']);

    // result
    expect(result.current.disabled).toBe(true);
  });

  it('should move each piece of selected points as a whole to the edge of all of them', () => {
    // mock
    editVector();

    // before
    const { result } = renderHook(() => useVectorEditAlignment(), { wrapper });

    selectPoints(['a1', 'a2', 'a3', 'a4', 'b1', 'b2']);

    // result
    expect(result.current.disabled).toBe(false);

    // action
    act(() => {
      result.current.onSelectHorizontal(AlignmentHorizontal.right);
    });

    // result — the square moves to the right edge, the two points of the other square stay at it
    expect(readVector().vertices.a1).toEqual({ id: 'a1', x: 40, y: 0 });
    expect(readVector().vertices.b1).toEqual({ id: 'b1', x: 30, y: 20 });

    // action
    act(() => {
      result.current.onSelectVertical(AlignmentVertical.top);
    });

    // result — the two points leave their square behind
    expect(readVector().vertices.b1).toEqual({ id: 'b1', x: 30, y: 0 });
    expect(readVector().vertices.b3).toEqual({ id: 'b3', x: 50, y: 40 });
  });

  it('should align pieces from different edited vectors', () => {
    // mock
    editVector();
    store.dispatch(
      addNodes({
        nodes: [
          makeNetworkVector({ c1: { x: 200, y: 0 }, c2: { x: 200, y: 50 } }, [['c1', 'c2']], { cornerRadius: 9, id: 'second-vector' }),
        ],
        rootIds: ['second-vector'],
      }),
    );
    store.dispatch(setSelection(['edit-vector', 'second-vector']));
    store.dispatch(setVectorEditingNodeIds(['edit-vector', 'second-vector']));

    // before
    const { result } = renderHook(() => useVectorEditAlignment(), { wrapper });

    selectPoints(['a1', 'a2', 'c1', 'c2']);

    // action
    act(() => {
      result.current.onSelectHorizontal(AlignmentHorizontal.left);
    });

    // result
    expect((selectActivePage(store.getState()).nodes['second-vector'] as TVectorNode).vertices.c1).toEqual({ id: 'c1', x: 0, y: 0 });
    expect(readVector().vertices.a1).toEqual({ id: 'a1', x: 0, y: 0 });
  });
});
