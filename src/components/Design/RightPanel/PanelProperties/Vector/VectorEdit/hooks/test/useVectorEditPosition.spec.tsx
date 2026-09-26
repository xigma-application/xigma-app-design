import { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';

// core
import CanvasRefsProvider from 'components/App/core/CanvasRefsProvider/CanvasRefsProvider';

// hooks
import { useVectorEditPosition } from '../useVectorEditPosition';

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
    store.dispatch(setVectorPointSelection({ handles: [], segmentIds, vertexIds }));
  });
};

const blurEvent = (value: string): Parameters<ReturnType<typeof useVectorEditPosition>['onBlurX']>[0] =>
  ({ target: { value } }) as Parameters<ReturnType<typeof useVectorEditPosition>['onBlurX']>[0];

describe('useVectorEditPosition', () => {
  it('should be empty and disabled while no vector is edited', () => {
    // before
    const { result } = renderHook(() => useVectorEditPosition(), { wrapper });

    // result
    expect(result.current).toMatchObject({ disabled: true, displayX: '', displayY: '' });
  });

  it('should be empty and disabled while no point is selected', () => {
    // mock
    editVector();

    // before
    const { result } = renderHook(() => useVectorEditPosition(), { wrapper });

    // result
    expect(result.current).toMatchObject({ disabled: true, displayX: '', displayY: '', x: 0, y: 0 });
  });

  it('should show the rounded top left corner of the selected points', () => {
    // mock
    editVector({ vertices: { ...twoSquares.vertices, b1: { id: 'b1', x: 30.456, y: 20 } } });

    // before
    const { result } = renderHook(() => useVectorEditPosition(), { wrapper });

    // action
    selectPoints(['b1', 'b3']);

    // result
    expect(result.current).toMatchObject({ disabled: false, displayX: 30.46, displayY: 20 });
  });

  it('should move the selected points when a value is typed or scrubbed', () => {
    // mock
    editVector();

    // before
    const { result } = renderHook(() => useVectorEditPosition(), { wrapper });

    selectPoints(['b1', 'b2']);

    // action
    act(() => {
      result.current.onBlurX(blurEvent('100'));
    });

    // result
    expect(readVector().vertices.b2).toEqual({ id: 'b2', x: 120, y: 20 });

    // action
    act(() => {
      result.current.onDragStart();
      result.current.onScrubY(25);
      result.current.onDragEnd();
    });

    // result
    expect(readVector().vertices.b1).toEqual({ id: 'b1', x: 100, y: 25 });

    // action
    act(() => {
      result.current.onBlurY(blurEvent('5'));
      result.current.onScrubX(90);
    });

    // result
    expect(readVector().vertices.b1).toEqual({ id: 'b1', x: 90, y: 5 });
  });

  it('should show and move the end of the selected handle', () => {
    // mock
    editVector({
      segments: { ...twoSquares.segments, s0: { ...twoSquares.segments.s0, tangentEnd: { x: -2, y: 6 }, tangentStart: { x: 3, y: -4 } } },
    });

    // before
    const { result } = renderHook(() => useVectorEditPosition(), { wrapper });

    act(() => {
      store.dispatch(setVectorPointSelection({ handles: [{ end: 'start', segmentId: 's0' }], segmentIds: [], vertexIds: [] }));
    });

    // result
    expect(result.current).toMatchObject({ disabled: false, displayX: 3, displayY: -4 });

    // action
    act(() => {
      result.current.onScrubX(13);
    });

    // result
    expect(readVector().segments.s0.tangentStart).toEqual({ x: 13, y: -4 });
  });
});
