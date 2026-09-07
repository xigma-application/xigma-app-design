import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ReactNode } from 'react';

// hooks
import { useColumnMinMaxDimensions } from '../useColumnMinMaxDimensions';

// store
import { addNode, setMinMaxRevealed, setSelection, updateNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';
import { undo } from 'store/history/actions';

// types
import { NodeType } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const renderUseColumnMinMaxDimensions = (): ReturnType<typeof renderHook<ReturnType<typeof useColumnMinMaxDimensions>, unknown>> =>
  renderHook(() => useColumnMinMaxDimensions(), { wrapper });

const addFrameNode = (): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fill: '#ff0000',
      height: 50,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 100,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const readNode = (id: string): TFrameNode => selectActivePage(store.getState()).nodes[id] as TFrameNode;

describe('useColumnMinMaxDimensions', () => {
  beforeEach(() => {
    (['maxHeight', 'maxWidth', 'minHeight', 'minWidth'] as const).forEach((bound) => {
      store.dispatch(setMinMaxRevealed({ bound, value: false }));
    });
  });

  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should report every bound as unset by default', () => {
    // before
    const { result } = renderUseColumnMinMaxDimensions();

    // result
    expect(result.current).toMatchObject({ hasMaxHeight: false, hasMaxWidth: false, hasMinHeight: false, hasMinWidth: false });
  });

  it('should read the selected frame’s existing bound values without revealing the rows', () => {
    // mock
    const frameId = addFrameNode();

    store.dispatch(updateNode({ changes: { maxHeight: 90, maxWidth: 80, minHeight: 30, minWidth: 20 }, id: frameId }));
    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnMinMaxDimensions();

    // result — values are read, but the rows stay hidden until explicitly revealed
    expect(result.current).toMatchObject({
      hasMaxHeight: false,
      hasMaxWidth: false,
      hasMinHeight: false,
      hasMinWidth: false,
      maxHeight: 90,
      maxWidth: 80,
      minHeight: 30,
      minWidth: 20,
    });
  });

  it('should show a row only once its bound is revealed', () => {
    // mock
    const frameId = addFrameNode();

    store.dispatch(updateNode({ changes: { minWidth: 20 }, id: frameId }));
    store.dispatch(setSelection([frameId]));
    store.dispatch(setMinMaxRevealed({ bound: 'minWidth', value: true }));

    // before
    const { result } = renderUseColumnMinMaxDimensions();

    // result
    expect(result.current).toMatchObject({ hasMinWidth: true, minWidth: 20 });
  });

  it('should shrink the frame width to a newly committed maxWidth', () => {
    // mock
    const frameId = addFrameNode();

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnMinMaxDimensions();

    // action
    act(() => result.current.onCommitMaxWidth(60));

    // result
    expect(readNode(frameId)).toMatchObject({ maxWidth: 60, width: 60 });
  });

  it('should grow the frame width to a newly committed minWidth', () => {
    // mock
    const frameId = addFrameNode();

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnMinMaxDimensions();

    // action
    act(() => result.current.onCommitMinWidth(150));

    // result
    expect(readNode(frameId)).toMatchObject({ minWidth: 150, width: 150 });
  });

  it('should shrink the frame height to a newly committed maxHeight', () => {
    // mock
    const frameId = addFrameNode();

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnMinMaxDimensions();

    // action
    act(() => result.current.onCommitMaxHeight(30));

    // result
    expect(readNode(frameId)).toMatchObject({ height: 30, maxHeight: 30 });
  });

  it('should commit a new minWidth', () => {
    // mock
    const frameId = addFrameNode();

    store.dispatch(updateNode({ changes: { minWidth: 20 }, id: frameId }));
    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnMinMaxDimensions();

    // action
    act(() => result.current.onCommitMinWidth(50));

    // result
    expect(readNode(frameId).minWidth).toBe(50);
  });

  it('should commit a new maxWidth', () => {
    // mock
    const frameId = addFrameNode();

    store.dispatch(updateNode({ changes: { maxWidth: 200 }, id: frameId }));
    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnMinMaxDimensions();

    // action
    act(() => result.current.onCommitMaxWidth(120));

    // result
    expect(readNode(frameId).maxWidth).toBe(120);
  });

  it('should commit a new minHeight', () => {
    // mock
    const frameId = addFrameNode();

    store.dispatch(updateNode({ changes: { minHeight: 10 }, id: frameId }));
    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnMinMaxDimensions();

    // action
    act(() => result.current.onCommitMinHeight(25));

    // result
    expect(readNode(frameId).minHeight).toBe(25);
  });

  it('should push minWidth down when a committed maxWidth goes below it', () => {
    // mock
    const frameId = addFrameNode();

    store.dispatch(updateNode({ changes: { maxWidth: 80, minWidth: 50 }, id: frameId }));
    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnMinMaxDimensions();

    // action
    act(() => result.current.onCommitMaxWidth(30));

    // result
    expect(readNode(frameId)).toMatchObject({ maxWidth: 30, minWidth: 30 });
  });

  it('should push maxHeight up when a committed minHeight exceeds it', () => {
    // mock
    const frameId = addFrameNode();

    store.dispatch(updateNode({ changes: { maxHeight: 40, minHeight: 10 }, id: frameId }));
    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnMinMaxDimensions();

    // action
    act(() => result.current.onCommitMinHeight(60));

    // result
    expect(readNode(frameId)).toMatchObject({ maxHeight: 60, minHeight: 60 });
  });

  it('should push maxWidth up when a committed minWidth exceeds it', () => {
    // mock
    const frameId = addFrameNode();

    store.dispatch(updateNode({ changes: { maxWidth: 40, minWidth: 20 }, id: frameId }));
    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnMinMaxDimensions();

    // action
    act(() => result.current.onCommitMinWidth(60));

    // result
    expect(readNode(frameId)).toMatchObject({ maxWidth: 60, minWidth: 60 });
  });

  it('should commit a new maxHeight', () => {
    // mock
    const frameId = addFrameNode();

    store.dispatch(updateNode({ changes: { maxHeight: 200 }, id: frameId }));
    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnMinMaxDimensions();

    // action
    act(() => result.current.onCommitMaxHeight(70));

    // result
    expect(readNode(frameId).maxHeight).toBe(70);
  });

  it('should push minHeight down when a committed maxHeight goes below it', () => {
    // mock
    const frameId = addFrameNode();

    store.dispatch(updateNode({ changes: { maxHeight: 80, minHeight: 50 }, id: frameId }));
    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnMinMaxDimensions();

    // action
    act(() => result.current.onCommitMaxHeight(30));

    // result
    expect(readNode(frameId)).toMatchObject({ maxHeight: 30, minHeight: 30 });
  });

  it('should clear minWidth (not floor it) when committed to 0', () => {
    // mock
    const frameId = addFrameNode();

    store.dispatch(updateNode({ changes: { minWidth: 20 }, id: frameId }));
    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnMinMaxDimensions();

    // action
    act(() => result.current.onCommitMinWidth(0));

    // result
    expect(readNode(frameId).minWidth).toBeUndefined();
    expect(store.getState().design.revealedMinMax.minWidth).toBe(false);
  });

  it('should clear minWidth when committed to a negative value', () => {
    // mock
    const frameId = addFrameNode();

    store.dispatch(updateNode({ changes: { minWidth: 20 }, id: frameId }));
    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnMinMaxDimensions();

    // action
    act(() => result.current.onCommitMinWidth(-5));

    // result
    expect(readNode(frameId).minWidth).toBeUndefined();
  });

  it('should clear maxWidth (not floor it) when committed to 0', () => {
    // mock
    const frameId = addFrameNode();

    store.dispatch(updateNode({ changes: { maxWidth: 200 }, id: frameId }));
    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnMinMaxDimensions();

    // action
    act(() => result.current.onCommitMaxWidth(0));

    // result
    expect(readNode(frameId).maxWidth).toBeUndefined();
    expect(store.getState().design.revealedMinMax.maxWidth).toBe(false);
  });

  it('should clear minHeight when committed to 0', () => {
    // mock
    const frameId = addFrameNode();

    store.dispatch(updateNode({ changes: { minHeight: 20 }, id: frameId }));
    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnMinMaxDimensions();

    // action
    act(() => result.current.onCommitMinHeight(0));

    // result
    expect(readNode(frameId).minHeight).toBeUndefined();
  });

  it('should clear maxHeight when committed to 0', () => {
    // mock
    const frameId = addFrameNode();

    store.dispatch(updateNode({ changes: { maxHeight: 200 }, id: frameId }));
    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnMinMaxDimensions();

    // action
    act(() => result.current.onCommitMaxHeight(0));

    // result
    expect(readNode(frameId).maxHeight).toBeUndefined();
  });

  it('should coalesce every scrub between onDragStart and onDragEnd into a single undo step', () => {
    // mock
    const frameId = addFrameNode();

    store.dispatch(updateNode({ changes: { maxWidth: 500, minWidth: 20 }, id: frameId }));
    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnMinMaxDimensions();

    // action
    act(() => {
      result.current.onDragStart();
      result.current.onCommitMinWidth(30);
      result.current.onCommitMinWidth(40);
      result.current.onDragEnd();
    });

    expect(readNode(frameId).minWidth).toBe(40);

    // action
    store.dispatch(undo());

    // result
    expect(readNode(frameId).minWidth).toBe(20);
  });

  it('should not throw when committing while nothing is selected', () => {
    // before
    const { result } = renderUseColumnMinMaxDimensions();

    // action / result
    expect(() => act(() => result.current.onCommitMinWidth(50))).not.toThrow();
  });
});
