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
import { LayoutMode, NodeType, SizingMode } from 'types/design/enums';
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

const addAutoLayoutFrameNode = (
  layoutMode: LayoutMode,
  primaryAxisSizingMode?: SizingMode,
  counterAxisSizingMode?: SizingMode,
  lockedAspectRatio = false,
): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      counterAxisSizingMode,
      fill: '#ff0000',
      height: 50,
      layoutMode,
      lockedAspectRatio,
      name: 'Frame',
      parentId: null,
      primaryAxisSizingMode,
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

  it('should not throw when scrubbing width/height while nothing is selected', () => {
    // before
    const { result } = renderUseColumnDimensions();

    // action / result
    expect(() => act(() => result.current.onScrubWidth(200))).not.toThrow();
    expect(() => act(() => result.current.onScrubHeight(200))).not.toThrow();
  });

  it('should not report auto-layout for a plain (freeForm/no layout) frame', () => {
    // mock
    const frameId = addFrameNode(100, 50);

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnDimensions();

    // result
    expect(result.current.isAutoLayout).toBe(false);
    expect(result.current.widthSizingMode).toBe(SizingMode.fixed);
    expect(result.current.heightSizingMode).toBe(SizingMode.fixed);
  });

  it('should map primary/counter axis sizing modes to width/height for a horizontal-flow frame', () => {
    // mock — horizontal flow: primary axis is width, counter axis is height
    const frameId = addAutoLayoutFrameNode(LayoutMode.horizontal, SizingMode.hug, SizingMode.fixed);

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnDimensions();

    // result
    expect(result.current.isAutoLayout).toBe(true);
    expect(result.current.widthSizingMode).toBe(SizingMode.hug);
    expect(result.current.heightSizingMode).toBe(SizingMode.fixed);
  });

  it('should map primary/counter axis sizing modes to width/height for a vertical-flow frame', () => {
    // mock — vertical flow: primary axis is height, counter axis is width
    const frameId = addAutoLayoutFrameNode(LayoutMode.vertical, SizingMode.hug, SizingMode.fixed);

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnDimensions();

    // result
    expect(result.current.isAutoLayout).toBe(true);
    expect(result.current.widthSizingMode).toBe(SizingMode.fixed);
    expect(result.current.heightSizingMode).toBe(SizingMode.hug);
  });

  it('should dispatch the width sizing mode onto the primary axis for a horizontal-flow frame', () => {
    // mock
    const frameId = addAutoLayoutFrameNode(LayoutMode.horizontal);

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnDimensions();

    // action
    act(() => result.current.onSelectWidthSizingMode(SizingMode.hug));

    // result
    expect(readNode(frameId).primaryAxisSizingMode).toBe(SizingMode.hug);
  });

  it('should dispatch the width sizing mode onto the counter axis for a vertical-flow frame', () => {
    // mock
    const frameId = addAutoLayoutFrameNode(LayoutMode.vertical);

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnDimensions();

    // action
    act(() => result.current.onSelectWidthSizingMode(SizingMode.hug));

    // result
    expect(readNode(frameId).counterAxisSizingMode).toBe(SizingMode.hug);
  });

  it('should dispatch the height sizing mode onto the counter axis for a horizontal-flow frame', () => {
    // mock
    const frameId = addAutoLayoutFrameNode(LayoutMode.horizontal);

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnDimensions();

    // action
    act(() => result.current.onSelectHeightSizingMode(SizingMode.hug));

    // result
    expect(readNode(frameId).counterAxisSizingMode).toBe(SizingMode.hug);
  });

  it('should dispatch the height sizing mode onto the primary axis for a vertical-flow frame', () => {
    // mock
    const frameId = addAutoLayoutFrameNode(LayoutMode.vertical);

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnDimensions();

    // action
    act(() => result.current.onSelectHeightSizingMode(SizingMode.hug));

    // result
    expect(readNode(frameId).primaryAxisSizingMode).toBe(SizingMode.hug);
  });

  it('should switch the width axis back to fixed when the width is resized while it was hugging', () => {
    // mock — horizontal flow: width is the primary axis
    const frameId = addAutoLayoutFrameNode(LayoutMode.horizontal, SizingMode.hug);

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnDimensions();

    // action
    act(() => result.current.onScrubWidth(200));

    // result
    expect(readNode(frameId)).toMatchObject({ primaryAxisSizingMode: SizingMode.fixed, width: 200 });
  });

  it('should leave the width axis untouched when resizing while it was already fixed', () => {
    // mock
    const frameId = addAutoLayoutFrameNode(LayoutMode.horizontal, SizingMode.fixed);

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnDimensions();

    // action
    act(() => result.current.onScrubWidth(200));

    // result
    expect(readNode(frameId)).toMatchObject({ primaryAxisSizingMode: SizingMode.fixed, width: 200 });
  });

  it('should switch the height axis back to fixed when the height is resized while it was hugging', () => {
    // mock — horizontal flow: height is the counter axis
    const frameId = addAutoLayoutFrameNode(LayoutMode.horizontal, SizingMode.fixed, SizingMode.hug);

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnDimensions();

    // action
    act(() => result.current.onScrubHeight(120));

    // result
    expect(readNode(frameId)).toMatchObject({ counterAxisSizingMode: SizingMode.fixed, height: 120 });
  });

  it('should switch the correct (counter) axis back to fixed when width is resized on a vertical-flow frame', () => {
    // mock — vertical flow: width is the counter axis
    const frameId = addAutoLayoutFrameNode(LayoutMode.vertical, SizingMode.fixed, SizingMode.hug);

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnDimensions();

    // action
    act(() => result.current.onScrubWidth(200));

    // result
    expect(readNode(frameId)).toMatchObject({ counterAxisSizingMode: SizingMode.fixed, width: 200 });
  });

  it('should reset both sizing-mode axes to fixed when the lock is turned on', () => {
    // mock
    const frameId = addAutoLayoutFrameNode(LayoutMode.horizontal, SizingMode.hug, SizingMode.hug);

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnDimensions();

    // action
    act(() => result.current.onToggleLock());

    // result
    expect(readNode(frameId)).toMatchObject({
      counterAxisSizingMode: SizingMode.fixed,
      lockedAspectRatio: true,
      primaryAxisSizingMode: SizingMode.fixed,
    });
  });

  it('should not touch sizing modes when the lock is turned off', () => {
    // mock
    const frameId = addAutoLayoutFrameNode(LayoutMode.horizontal, SizingMode.hug, SizingMode.hug, true);

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnDimensions();

    // action
    act(() => result.current.onToggleLock());

    // result
    expect(readNode(frameId)).toMatchObject({
      counterAxisSizingMode: SizingMode.hug,
      lockedAspectRatio: false,
      primaryAxisSizingMode: SizingMode.hug,
    });
  });

  it('should not touch sizing modes when turning the lock on for a non-auto-layout frame', () => {
    // mock
    const frameId = addFrameNode(100, 50);

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnDimensions();

    // action
    act(() => result.current.onToggleLock());

    // result
    const node = readNode(frameId);

    expect(node.lockedAspectRatio).toBe(true);
    expect(node.primaryAxisSizingMode).toBeUndefined();
    expect(node.counterAxisSizingMode).toBeUndefined();
  });

  it('should turn the lock off when the width axis is switched to hug', () => {
    // mock
    const frameId = addAutoLayoutFrameNode(LayoutMode.horizontal, SizingMode.fixed, SizingMode.fixed, true);

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnDimensions();

    // action
    act(() => result.current.onSelectWidthSizingMode(SizingMode.hug));

    // result
    expect(readNode(frameId)).toMatchObject({ lockedAspectRatio: false, primaryAxisSizingMode: SizingMode.hug });
  });

  it('should turn the lock off when the height axis is switched to hug', () => {
    // mock
    const frameId = addAutoLayoutFrameNode(LayoutMode.horizontal, SizingMode.fixed, SizingMode.fixed, true);

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnDimensions();

    // action
    act(() => result.current.onSelectHeightSizingMode(SizingMode.hug));

    // result
    expect(readNode(frameId)).toMatchObject({ counterAxisSizingMode: SizingMode.hug, lockedAspectRatio: false });
  });

  it('should leave the lock untouched when switching an axis to fixed', () => {
    // mock
    const frameId = addAutoLayoutFrameNode(LayoutMode.horizontal, SizingMode.hug, SizingMode.fixed, true);

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnDimensions();

    // action
    act(() => result.current.onSelectWidthSizingMode(SizingMode.fixed));

    // result
    expect(readNode(frameId)).toMatchObject({ lockedAspectRatio: true, primaryAxisSizingMode: SizingMode.fixed });
  });

  it('should leave the lock untouched (already off) when switching an axis to hug', () => {
    // mock
    const frameId = addAutoLayoutFrameNode(LayoutMode.horizontal);

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnDimensions();

    // action
    act(() => result.current.onSelectWidthSizingMode(SizingMode.hug));

    // result
    expect(readNode(frameId)).toMatchObject({ lockedAspectRatio: false, primaryAxisSizingMode: SizingMode.hug });
  });
});
