import { act, renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { Provider } from 'react-redux';

// hooks
import { useStartOffsetVector } from '../useStartOffsetVector';

// store
import { addNodes, setOffsetVector, setSelection } from 'store/design/slice';
import { selectOffsetVector } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType, StrokeJoin } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const makeNode = (id: string, type: NodeType.line | NodeType.rectangle): TSceneNode =>
  ({ fills: [], height: 0, id, name: id, parentId: null, rotation: 0, type, width: 10, x: 0, y: 0 }) as unknown as TSceneNode;

describe('useStartOffsetVector', () => {
  beforeAll(() => {
    store.dispatch(
      addNodes({
        nodes: [makeNode('lineA', NodeType.line), makeNode('lineB', NodeType.line), makeNode('rectangleA', NodeType.rectangle)],
        rootIds: ['lineA', 'lineB', 'rectangleA'],
      }),
    );
  });

  afterEach(() => {
    store.dispatch(setOffsetVector(null));
    store.dispatch(setSelection([]));
  });

  it('should start offsetting the one selected line by 20 with sharp corners', () => {
    // mock
    store.dispatch(setSelection(['lineA']));

    // before
    const { result } = renderHook(() => useStartOffsetVector(), { wrapper });

    // action
    act(() => result.current.onStart());

    // result
    expect(result.current.canStart).toBe(true);
    expect(selectOffsetVector(store.getState())).toEqual({ distance: 20, join: StrokeJoin.miter, nodeId: 'lineA' });
  });

  it('should not offer an offset for several selected lines', () => {
    // mock
    store.dispatch(setSelection(['lineA', 'lineB']));

    // before
    const { result } = renderHook(() => useStartOffsetVector(), { wrapper });

    // result
    expect(result.current.canStart).toBe(false);
  });

  it('should not offer an offset for a layer Offset vector cannot turn', () => {
    // mock
    store.dispatch(setSelection(['rectangleA']));

    // before
    const { result } = renderHook(() => useStartOffsetVector(), { wrapper });

    // result
    expect(result.current.canStart).toBe(false);
  });
});
