import { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';

// core
import CanvasRefsProvider from 'components/App/core/CanvasRefsProvider/CanvasRefsProvider';

// hooks
import { useVectorEditMirroring } from '../useVectorEditMirroring';

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

describe('useVectorEditMirroring', () => {
  it('should be disabled with no value while no vector is edited', () => {
    // before
    const { result } = renderHook(() => useVectorEditMirroring(), { wrapper });

    // result
    expect(result.current).toMatchObject({ disabled: true, value: '' });
  });

  it('should be disabled with no value while no point is selected', () => {
    // mock
    editVector();

    // before
    const { result } = renderHook(() => useVectorEditMirroring(), { wrapper });

    // result
    expect(result.current).toMatchObject({ disabled: true, value: '' });
  });

  it('should show the mirroring of the selected points and set it on all of them', () => {
    // mock
    editVector({ vertexHandleModes: { a1: 'smooth', b1: 'symmetric' } });

    // before
    const { result } = renderHook(() => useVectorEditMirroring(), { wrapper });

    selectPoints(['a1', 'a2']);

    // result
    expect(result.current).toMatchObject({ disabled: false, value: '' });

    // action
    act(() => {
      result.current.onChange('symmetric');
    });

    // result
    expect(readVector().vertexHandleModes).toEqual({ a1: 'symmetric', a2: 'symmetric', b1: 'symmetric' });
    expect(result.current.value).toBe('symmetric');
  });

  it('should set the mirroring of the point the selected handle comes out of', () => {
    // mock
    editVector({
      segments: { ...twoSquares.segments, s0: { ...twoSquares.segments.s0, tangentEnd: { x: -2, y: 6 }, tangentStart: { x: 3, y: -4 } } },
    });

    // before
    const { result } = renderHook(() => useVectorEditMirroring(), { wrapper });

    act(() => {
      store.dispatch(setVectorPointSelection({ handles: [{ end: 'start', segmentId: 's0' }], segmentIds: [], vertexIds: [] }));
    });

    // action
    act(() => {
      result.current.onChange('smooth');
    });

    // result
    expect(readVector().vertexHandleModes).toEqual({ a1: 'smooth' });
  });

  it('should set the mirroring of the selected points in every edited vector', () => {
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
    const { result } = renderHook(() => useVectorEditMirroring(), { wrapper });

    selectPoints(['a1', 'c1']);

    // action
    act(() => {
      result.current.onChange('smooth');
    });

    // result
    expect(readVector().vertexHandleModes).toEqual({ a1: 'smooth' });
    expect((selectActivePage(store.getState()).nodes['second-vector'] as TVectorNode).vertexHandleModes).toEqual({ c1: 'smooth' });
  });
});
