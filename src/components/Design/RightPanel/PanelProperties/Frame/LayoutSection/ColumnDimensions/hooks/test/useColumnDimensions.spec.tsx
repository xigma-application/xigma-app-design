import { Provider } from 'react-redux';
import { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';

// hooks
import { useColumnDimensions } from '../useColumnDimensions';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';
import { undo } from 'store/history/actions';

// types
import { NodeType } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const renderUseColumnDimensions = (): ReturnType<typeof renderHook<ReturnType<typeof useColumnDimensions>, unknown>> =>
  renderHook(() => useColumnDimensions(), { wrapper });

const addFrameNode = (width: number, height: number, lockedAspectRatio = false): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fill: '#ff0000',
      height,
      lockedAspectRatio,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const readNode = (id: string): TFrameNode => selectActivePage(store.getState()).nodes[id] as TFrameNode;

describe('useColumnDimensions', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should expose the selected frame width, height and lock state', () => {
    // mock
    const frameId = addFrameNode(100, 50, true);

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnDimensions();

    // result
    expect(result.current).toMatchObject({ height: 50, locked: true, width: 100 });
  });

  it('should commit a new width on scrub without touching the height when unlocked', () => {
    // mock
    const frameId = addFrameNode(100, 50);

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnDimensions();

    // action
    act(() => result.current.onScrubWidth(200));

    // result
    expect(readNode(frameId)).toMatchObject({ height: 50, width: 200 });
  });

  it('should scale the height on scrub to keep the ratio when locked', () => {
    // mock
    const frameId = addFrameNode(100, 50, true);

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnDimensions();

    // action
    act(() => result.current.onScrubWidth(200));

    // result
    expect(readNode(frameId)).toMatchObject({ height: 100, width: 200 });
  });

  it('should scale the width on scrub to keep the ratio when locked', () => {
    // mock
    const frameId = addFrameNode(100, 50, true);

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnDimensions();

    // action
    act(() => result.current.onScrubHeight(100));

    // result
    expect(readNode(frameId)).toMatchObject({ height: 100, width: 200 });
  });

  it('should commit a new width on blur', () => {
    // mock
    const frameId = addFrameNode(100, 50);

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnDimensions();
    const input = Object.assign(document.createElement('input'), { value: '326' });

    // action
    act(() => result.current.onBlurWidth({ target: input } as unknown as Parameters<typeof result.current.onBlurWidth>[0]));

    // result
    expect(readNode(frameId)).toMatchObject({ width: 326 });
  });

  it('should toggle the lock state', () => {
    // mock
    const frameId = addFrameNode(100, 50);

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnDimensions();

    // action
    act(() => result.current.onToggleLock());

    // result
    expect(readNode(frameId).lockedAspectRatio).toBe(true);

    // action
    act(() => result.current.onToggleLock());

    // result
    expect(readNode(frameId).lockedAspectRatio).toBe(false);
  });

  it('should coalesce every scrub between onDragStart and onDragEnd into a single undo step', () => {
    // mock
    const frameId = addFrameNode(100, 50, true);

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnDimensions();

    // action
    act(() => {
      result.current.onDragStart();
      result.current.onScrubWidth(150);
      result.current.onScrubWidth(200);
      result.current.onScrubWidth(300);
      result.current.onDragEnd();
    });

    expect(readNode(frameId)).toMatchObject({ height: 150, width: 300 });

    // action
    store.dispatch(undo());

    // result
    expect(readNode(frameId)).toMatchObject({ height: 50, width: 100 });
  });
});
