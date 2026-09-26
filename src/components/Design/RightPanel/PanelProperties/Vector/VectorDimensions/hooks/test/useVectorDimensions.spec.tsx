import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { act, renderHook } from '@testing-library/react';

// hooks
import { useVectorDimensions } from '../useVectorDimensions';

// store
import { addNodes, setSelection } from 'store/design/slice';
import { selectNodes } from 'store/design/selectors';
import { store } from 'store';
import { undo } from 'store/history/actions';

// types
import { TVectorNode } from 'types/design/types';

// utils
import { getVectorNodeBounds } from 'utils/canvas/vectorNetwork/getVectorNodeBounds';
import { makeNetworkVector } from 'utils/canvas/vector/stroke/test/fixtures';

type TBlurEvent = Parameters<ReturnType<typeof useVectorDimensions>['onBlurWidth']>[0];

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const blurWith = (value: string): TBlurEvent => ({ target: { value } }) as unknown as TBlurEvent;

const readVector = (id: string): TVectorNode => selectNodes(store.getState())[id] as TVectorNode;

let nextId = 0;

const addSquare = (size: number): string => {
  nextId += 1;

  const id = `dimensions-vector-${nextId}`;
  const square = makeNetworkVector(
    { a: { x: 0, y: 0 }, b: { x: size, y: 0 }, c: { x: size, y: size / 2 }, d: { x: 0, y: size / 2 } },
    [
      ['a', 'b'],
      ['b', 'c'],
      ['c', 'd'],
      ['d', 'a'],
    ],
    { id },
  );

  store.dispatch(addNodes({ nodes: [square], rootIds: [id] }));

  return id;
};

describe('useVectorDimensions', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should show the size of the selected vector bounds rounded to two decimals', () => {
    // mock
    const id = `dimensions-rounded-${nextId}`;

    store.dispatch(
      addNodes({ nodes: [makeNetworkVector({ a: { x: 0, y: 0 }, b: { x: 10.456, y: 3.333 } }, [['a', 'b']], { id })], rootIds: [id] }),
    );
    store.dispatch(setSelection([id]));

    // before
    const { result } = renderHook(() => useVectorDimensions(), { wrapper });

    // result
    expect(result.current.width).toBe(10.46);
    expect(result.current.height).toBe(3.33);
    expect(result.current.locked).toBe(false);
  });

  it('should show Mixed for a size the selected vectors do not share', () => {
    // mock
    store.dispatch(setSelection([addSquare(100), addSquare(40)]));

    // before
    const { result } = renderHook(() => useVectorDimensions(), { wrapper });

    // result
    expect(result.current.displayWidth).toBe('Mixed');
    expect(result.current.displayHeight).toBe('Mixed');
  });

  it('should resize every selected vector to a typed width in one undo step', () => {
    // mock
    const ids = [addSquare(100), addSquare(40)];

    store.dispatch(setSelection(ids));

    // before
    const { result } = renderHook(() => useVectorDimensions(), { wrapper });

    // action
    act(() => result.current.onBlurWidth(blurWith('80')));

    // result
    expect(ids.map((id) => getVectorNodeBounds(readVector(id)).width)).toEqual([80, 80]);

    // action
    act(() => {
      store.dispatch(undo());
    });

    // result
    expect(ids.map((id) => getVectorNodeBounds(readVector(id)).width)).toEqual([100, 40]);
  });

  it('should keep the aspect ratio once locked, and scrub the height inside one gesture', () => {
    // mock
    const id = addSquare(100);

    store.dispatch(setSelection([id]));

    // before
    const { result } = renderHook(() => useVectorDimensions(), { wrapper });

    // action
    act(() => result.current.onToggleLock());

    // result
    expect(readVector(id).lockedAspectRatio).toBe(true);
    expect(result.current.locked).toBe(true);

    // action
    act(() => result.current.onDragStart());
    act(() => result.current.onScrubHeight(100));
    act(() => result.current.onDragEnd());

    // result
    expect(getVectorNodeBounds(readVector(id))).toMatchObject({ height: 100, width: 200 });

    // action
    act(() => result.current.onBlurHeight(blurWith('25')));

    // result
    expect(getVectorNodeBounds(readVector(id))).toMatchObject({ height: 25, width: 50 });
  });

  it('should show a zero size while no vector is selected', () => {
    // before
    const { result } = renderHook(() => useVectorDimensions(), { wrapper });

    // result
    expect(result.current.width).toBe(0);
    expect(result.current.height).toBe(0);
    expect(result.current.locked).toBe(false);
  });
});
