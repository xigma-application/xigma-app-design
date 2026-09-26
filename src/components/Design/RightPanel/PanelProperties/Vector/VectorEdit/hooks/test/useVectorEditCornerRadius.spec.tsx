import { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';

// core
import CanvasRefsProvider from 'components/App/core/CanvasRefsProvider/CanvasRefsProvider';

// hooks
import { useVectorEditCornerRadius } from '../useVectorEditCornerRadius';

// store
import { addNodes, setSelection, setVectorEditingNodeIds, setVectorPointSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { TVectorNode } from 'types/design/types';

// utils
import { makeNetworkVector } from 'utils/canvas/vector/stroke/test/fixtures';

// others
import { MIXED_LABEL } from 'components/Design/RightPanel/PanelProperties/Common/constants';

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

describe('useVectorEditCornerRadius', () => {
  it('should read 0 for all corners while no vector is edited', () => {
    // before
    const { result } = renderHook(() => useVectorEditCornerRadius(), { wrapper });

    // result
    expect(result.current).toMatchObject({ iconName: 'Corners', value: 0, valueLabel: 0 });
  });

  it('should show Mixed for the whole vector when its points have different radii, and set one radius for all of them', () => {
    // mock
    editVector({ cornerRadius: 4, cornerRadiusByVertexId: { b1: 9 } });

    // before
    const { result } = renderHook(() => useVectorEditCornerRadius(), { wrapper });

    // result
    expect(result.current).toMatchObject({ iconName: 'Corners', valueLabel: MIXED_LABEL });

    // action
    act(() => {
      result.current.onCommit('12');
    });

    // result
    expect(readVector()).toMatchObject({ cornerRadius: 12, cornerRadiusByVertexId: undefined });
    expect(result.current.valueLabel).toBe(12);
  });

  it('should show and set the radius of the selected points only', () => {
    // mock
    editVector({ cornerRadius: 4 });

    // before
    const { result } = renderHook(() => useVectorEditCornerRadius(), { wrapper });

    selectPoints(['a1']);

    // result
    expect(result.current).toMatchObject({ iconName: 'BorderRadiusT', value: 4, valueLabel: 4 });

    // action
    act(() => {
      result.current.onCommit('abc');
      result.current.onScrub(7);
    });

    // result
    expect(readVector()).toMatchObject({ cornerRadius: 4, cornerRadiusByVertexId: { a1: 7 } });
  });

  it('should set the radius of the point the selected handle comes out of', () => {
    // mock
    editVector({
      ...{
        segments: { ...twoSquares.segments, s0: { ...twoSquares.segments.s0, tangentEnd: { x: -2, y: 6 }, tangentStart: { x: 3, y: -4 } } },
      },
      cornerRadius: 2,
    });

    // before
    const { result } = renderHook(() => useVectorEditCornerRadius(), { wrapper });

    act(() => {
      store.dispatch(setVectorPointSelection({ handles: [{ end: 'start', segmentId: 's0' }], segmentIds: [], vertexIds: [] }));
    });

    // result
    expect(result.current).toMatchObject({ iconName: 'BorderRadiusT', valueLabel: 2 });

    // action
    act(() => {
      result.current.onCommit('8');
    });

    // result
    expect(readVector().cornerRadiusByVertexId).toEqual({ a1: 8 });
  });

  it('should show Mixed across edited vectors with different radii and set one radius on all of them', () => {
    // mock
    editVector({ cornerRadius: 3 });
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
    const { result } = renderHook(() => useVectorEditCornerRadius(), { wrapper });

    // result
    expect(result.current.valueLabel).toBe(MIXED_LABEL);

    // action
    act(() => {
      result.current.onCommit('5');
    });

    // result
    expect(readVector().cornerRadius).toBe(5);
    expect((selectActivePage(store.getState()).nodes['second-vector'] as TVectorNode).cornerRadius).toBe(5);
  });
});
