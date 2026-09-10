import { Provider } from 'react-redux';
import { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';

// hooks
import { useColumnDimensions } from '../useColumnDimensions';

// store
import { addNode, moveNodes, setSelection, updateNode } from 'store/design/slice';
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
  widthSizingMode?: SizingMode,
  heightSizingMode?: SizingMode,
  lockedAspectRatio = false,
): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fill: '#ff0000',
      height: 50,
      heightSizingMode,
      layoutMode,
      lockedAspectRatio,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 100,
      widthSizingMode,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const readNode = (id: string): TFrameNode => selectActivePage(store.getState()).nodes[id] as TFrameNode;

const moveIntoParent = (childId: string, parentId: string): void => {
  store.dispatch(moveNodes({ nodeIds: [childId], targetIndex: 0, targetParentId: parentId }));
};

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

  it('should not report canHug for a plain (freeForm/no layout) frame', () => {
    // mock
    const frameId = addFrameNode(100, 50);

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnDimensions();

    // result
    expect(result.current.canHug).toBe(false);
    expect(result.current.widthSizingMode).toBe(SizingMode.fixed);
    expect(result.current.heightSizingMode).toBe(SizingMode.fixed);
  });

  it('should read the width/height sizing modes directly off the node, for a horizontal-flow frame', () => {
    // mock
    const frameId = addAutoLayoutFrameNode(LayoutMode.horizontal, SizingMode.hug, SizingMode.fixed);

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnDimensions();

    // result
    expect(result.current.canHug).toBe(true);
    expect(result.current.widthSizingMode).toBe(SizingMode.hug);
    expect(result.current.heightSizingMode).toBe(SizingMode.fixed);
  });

  it('should read the width/height sizing modes directly off the node, for a vertical-flow frame', () => {
    // mock — layout direction no longer affects which physical axis a mode belongs to
    const frameId = addAutoLayoutFrameNode(LayoutMode.vertical, SizingMode.fixed, SizingMode.hug);

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnDimensions();

    // result
    expect(result.current.canHug).toBe(true);
    expect(result.current.widthSizingMode).toBe(SizingMode.fixed);
    expect(result.current.heightSizingMode).toBe(SizingMode.hug);
  });

  it('should dispatch the selected width sizing mode straight onto widthSizingMode', () => {
    // mock
    const frameId = addAutoLayoutFrameNode(LayoutMode.horizontal);

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnDimensions();

    // action
    act(() => result.current.onSelectWidthSizingMode(SizingMode.hug));

    // result
    expect(readNode(frameId).widthSizingMode).toBe(SizingMode.hug);
  });

  it('should dispatch the selected height sizing mode straight onto heightSizingMode', () => {
    // mock
    const frameId = addAutoLayoutFrameNode(LayoutMode.vertical);

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnDimensions();

    // action
    act(() => result.current.onSelectHeightSizingMode(SizingMode.hug));

    // result
    expect(readNode(frameId).heightSizingMode).toBe(SizingMode.hug);
  });

  it('should switch the width axis back to fixed when the width is resized while it was hugging', () => {
    // mock
    const frameId = addAutoLayoutFrameNode(LayoutMode.horizontal, SizingMode.hug);

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnDimensions();

    // action
    act(() => result.current.onScrubWidth(200));

    // result
    expect(readNode(frameId)).toMatchObject({ width: 200, widthSizingMode: SizingMode.fixed });
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
    expect(readNode(frameId)).toMatchObject({ width: 200, widthSizingMode: SizingMode.fixed });
  });

  it('should switch the height axis back to fixed when the height is resized while it was hugging', () => {
    // mock
    const frameId = addAutoLayoutFrameNode(LayoutMode.horizontal, SizingMode.fixed, SizingMode.hug);

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnDimensions();

    // action
    act(() => result.current.onScrubHeight(120));

    // result
    expect(readNode(frameId)).toMatchObject({ height: 120, heightSizingMode: SizingMode.fixed });
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
      heightSizingMode: SizingMode.fixed,
      lockedAspectRatio: true,
      widthSizingMode: SizingMode.fixed,
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
      heightSizingMode: SizingMode.hug,
      lockedAspectRatio: false,
      widthSizingMode: SizingMode.hug,
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
    expect(node.widthSizingMode).toBeUndefined();
    expect(node.heightSizingMode).toBeUndefined();
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
    expect(readNode(frameId)).toMatchObject({ lockedAspectRatio: false, widthSizingMode: SizingMode.hug });
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
    expect(readNode(frameId)).toMatchObject({ heightSizingMode: SizingMode.hug, lockedAspectRatio: false });
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
    expect(readNode(frameId)).toMatchObject({ lockedAspectRatio: true, widthSizingMode: SizingMode.fixed });
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
    expect(readNode(frameId)).toMatchObject({ lockedAspectRatio: false, widthSizingMode: SizingMode.hug });
  });

  it('should not offer Fill on either axis for a top-level frame with no parent', () => {
    // mock
    const frameId = addAutoLayoutFrameNode(LayoutMode.horizontal);

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnDimensions();

    // result
    expect(result.current.canFillWidth).toBe(false);
    expect(result.current.canFillHeight).toBe(false);
  });

  it('should offer Fill on both axes when the parent is an auto-layout frame not hugging either axis', () => {
    // mock
    const parentId = addAutoLayoutFrameNode(LayoutMode.horizontal, SizingMode.fixed, SizingMode.fixed);
    const childId = addAutoLayoutFrameNode(LayoutMode.horizontal);

    moveIntoParent(childId, parentId);
    store.dispatch(setSelection([childId]));

    // before
    const { result } = renderUseColumnDimensions();

    // result
    expect(result.current.canFillWidth).toBe(true);
    expect(result.current.canFillHeight).toBe(true);
  });

  it('should not offer Fill on an axis where the parent frame itself hugs that axis', () => {
    // mock
    const parentId = addAutoLayoutFrameNode(LayoutMode.horizontal, SizingMode.hug, SizingMode.fixed);
    const childId = addAutoLayoutFrameNode(LayoutMode.horizontal);

    moveIntoParent(childId, parentId);
    store.dispatch(setSelection([childId]));

    // before
    const { result } = renderUseColumnDimensions();

    // result
    expect(result.current.canFillWidth).toBe(false);
    expect(result.current.canFillHeight).toBe(true);
  });

  it('should reset a direct child’s fill on the matching axis back to fixed when the parent switches that axis to hug', () => {
    // mock
    const parentId = addAutoLayoutFrameNode(LayoutMode.horizontal, SizingMode.fixed, SizingMode.fixed);
    const childId = addAutoLayoutFrameNode(LayoutMode.horizontal);

    moveIntoParent(childId, parentId);
    store.dispatch(updateNode({ changes: { widthSizingMode: SizingMode.fill }, id: childId }));
    store.dispatch(setSelection([parentId]));

    // before
    const { result } = renderUseColumnDimensions();

    // action — the parent itself starts hugging its width, so the filling child has no budget left
    act(() => result.current.onSelectWidthSizingMode(SizingMode.hug));

    // result
    expect(readNode(parentId).widthSizingMode).toBe(SizingMode.hug);
    expect(readNode(childId).widthSizingMode).toBe(SizingMode.fixed);
  });
});
