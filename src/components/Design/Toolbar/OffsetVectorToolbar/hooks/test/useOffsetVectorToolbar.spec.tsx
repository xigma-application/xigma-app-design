import { act, renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { Provider } from 'react-redux';

// hooks
import { useOffsetVectorToolbar } from '../useOffsetVectorToolbar';

// store
import { addNode, setOffsetVector } from 'store/design/slice';
import { selectOffsetVector } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType, StrokeJoin } from 'types/design/enums';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const startOnNewLine = (): void => {
  const { payload } = store.dispatch(
    addNode({ height: 0, name: 'Line', parentId: null, rotation: 0, strokes: [], type: NodeType.line, width: 50, x: 0, y: 0 }),
  );

  store.dispatch(setOffsetVector({ distance: 20, join: StrokeJoin.miter, nodeId: payload.id }));
};

describe('useOffsetVectorToolbar', () => {
  it('should stay hidden with the defaults outside the offset mode and ignore changes there', () => {
    // mock
    store.dispatch(setOffsetVector(null));

    // before
    const { result } = renderHook(() => useOffsetVectorToolbar(), { wrapper });

    // action
    act(() => {
      result.current.onDistanceChange(5);
      result.current.onJoinChange(StrokeJoin.round);
    });

    // result
    expect(result.current).toMatchObject({ distance: 20, isVisible: false, join: StrokeJoin.miter });
    expect(selectOffsetVector(store.getState())).toBeNull();
  });

  it('should show for a line and write the distance, never below zero, and the corner style', () => {
    // mock
    startOnNewLine();

    // before
    const { result } = renderHook(() => useOffsetVectorToolbar(), { wrapper });

    // action
    act(() => result.current.onDistanceChange(-5));
    act(() => result.current.onJoinChange(StrokeJoin.round));

    // result
    expect(result.current).toMatchObject({ distance: 0, isVisible: true, join: StrokeJoin.round });

    // action
    act(() => result.current.onJoinChange(StrokeJoin.miter));

    // result
    expect(result.current.join).toBe(StrokeJoin.miter);
  });

  it('should leave the offset mode on cancel and on confirm', () => {
    // mock
    startOnNewLine();

    // before
    const { result } = renderHook(() => useOffsetVectorToolbar(), { wrapper });

    // action
    act(() => result.current.onCancel());

    // result
    expect(selectOffsetVector(store.getState())).toBeNull();

    // mock
    startOnNewLine();

    // action
    act(() => result.current.onConfirm());

    // result
    expect(selectOffsetVector(store.getState())).toBeNull();
  });
});
