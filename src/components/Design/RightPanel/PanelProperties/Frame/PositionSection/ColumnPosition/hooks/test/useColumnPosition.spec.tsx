import { Provider } from 'react-redux';
import { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';

// hooks
import { useColumnPosition } from '../useColumnPosition';

// store
import { addNode, moveNodes, setSelection, updateNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';
import { undo } from 'store/history/actions';

// types
import { AlignmentHorizontal, LayoutMode, NodeType } from 'types/design/enums';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const renderUseColumnPosition = (): ReturnType<typeof renderHook<ReturnType<typeof useColumnPosition>, unknown>> =>
  renderHook(() => useColumnPosition(), { wrapper });

const addFrameNode = (x: number, y: number): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fill: '#ff0000',
      height: 20,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 20,
      x,
      y,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const readNode = (id: string): { x: number; y: number } => {
  const node = selectActivePage(store.getState()).nodes[id] as { x: number; y: number };

  return { x: node.x, y: node.y };
};

const nestFrame = (childId: string, parentId: string): void => {
  store.dispatch(moveNodes({ nodeIds: [childId], targetIndex: 0, targetParentId: parentId }));
};

describe('useColumnPosition', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should expose the selected frame x and y', () => {
    // mock
    const frameId = addFrameNode(10, 20);

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnPosition();

    // result
    expect(result.current).toMatchObject({ x: 10, y: 20 });
  });

  it('should commit a new x on scrub', () => {
    // mock
    const frameId = addFrameNode(10, 20);

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnPosition();

    // action
    act(() => result.current.onScrubX(-1010));

    // result
    expect(readNode(frameId).x).toBe(-1010);
  });

  it('should commit a new y on scrub', () => {
    // mock
    const frameId = addFrameNode(10, 20);

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnPosition();

    // action
    act(() => result.current.onScrubY(-810));

    // result
    expect(readNode(frameId).y).toBe(-810);
  });

  it('should commit a new x on blur', () => {
    // mock
    const frameId = addFrameNode(10, 20);

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnPosition();
    const input = Object.assign(document.createElement('input'), { value: '55' });

    // action
    act(() => result.current.onBlurX({ target: input } as unknown as Parameters<typeof result.current.onBlurX>[0]));

    // result
    expect(readNode(frameId).x).toBe(55);
  });

  it('should show the position relative to the parent origin for a nested frame', () => {
    // mock
    const parentId = addFrameNode(100, 50);

    store.dispatch(updateNode({ changes: { height: 300, width: 400 }, id: parentId }));

    const childId = addFrameNode(130, 90);

    nestFrame(childId, parentId);
    store.dispatch(setSelection([childId]));

    // before
    const { result } = renderUseColumnPosition();

    // result
    expect(result.current).toMatchObject({ disabledX: false, disabledY: false, x: 30, y: 40 });
  });

  it('should commit a nested frame position back to absolute coordinates', () => {
    // mock
    const parentId = addFrameNode(100, 50);

    store.dispatch(updateNode({ changes: { height: 300, width: 400 }, id: parentId }));

    const childId = addFrameNode(130, 90);

    nestFrame(childId, parentId);
    store.dispatch(setSelection([childId]));

    // before
    const { result } = renderUseColumnPosition();

    // action — type 10 into the parent-local X field
    act(() => result.current.onScrubX(10));

    // result — absolute x is parent.x + 10
    expect(readNode(childId).x).toBe(110);
    expect(readNode(childId).y).toBe(90);
  });

  it('should express a nested frame position in the parent local space when the parent is rotated', () => {
    // mock
    const parentId = addFrameNode(100, 50);

    store.dispatch(updateNode({ changes: { height: 200, rotation: 90, width: 300 }, id: parentId }));

    const childId = addFrameNode(400, 400);

    nestFrame(childId, parentId);
    store.dispatch(setSelection([childId]));

    // before
    const { result } = renderUseColumnPosition();

    // action — round-trips through the rotation: setting the shown value back must not move the frame
    const shownX = result.current.x;
    const shownY = result.current.y;

    act(() => result.current.onScrubX(shownX));
    act(() => result.current.onScrubY(shownY));

    // result
    expect(readNode(childId).x).toBeCloseTo(400, 0);
    expect(readNode(childId).y).toBeCloseTo(400, 0);
  });

  it('should disable the inputs when the parent runs a managed (auto) layout', () => {
    // mock
    const parentId = addFrameNode(0, 0);

    store.dispatch(updateNode({ changes: { height: 300, layoutMode: LayoutMode.horizontal, width: 400 }, id: parentId }));

    const childId = addFrameNode(20, 20);

    nestFrame(childId, parentId);
    store.dispatch(setSelection([childId]));

    // before
    const { result } = renderUseColumnPosition();

    // result
    expect(result.current.disabledX).toBe(true);
    expect(result.current.disabledY).toBe(true);
    expect(result.current.showIgnoreAutoLayoutToggle).toBe(true);
  });

  it('should not show the ignore-auto-layout toggle for a freeform parent', () => {
    // mock
    const parentId = addFrameNode(0, 0);

    store.dispatch(updateNode({ changes: { height: 300, width: 400 }, id: parentId }));

    const childId = addFrameNode(20, 20);

    nestFrame(childId, parentId);
    store.dispatch(setSelection([childId]));

    // before
    const { result } = renderUseColumnPosition();

    // result
    expect(result.current.showIgnoreAutoLayoutToggle).toBe(false);
  });

  it('should re-enable the inputs for a child that ignores its managed-layout parent', () => {
    // mock
    const parentId = addFrameNode(0, 0);

    store.dispatch(updateNode({ changes: { height: 300, layoutMode: LayoutMode.horizontal, width: 400 }, id: parentId }));

    const childId = addFrameNode(20, 20);

    nestFrame(childId, parentId);
    store.dispatch(updateNode({ changes: { ignoreAutoLayout: true }, id: childId }));
    store.dispatch(setSelection([childId]));

    // before
    const { result } = renderUseColumnPosition();

    // result
    expect(result.current.disabledX).toBe(false);
    expect(result.current.disabledY).toBe(false);
    expect(result.current.ignoresAutoLayout).toBe(true);
  });

  it('should toggle ignoreAutoLayout on and off', () => {
    // mock
    const parentId = addFrameNode(0, 0);

    store.dispatch(updateNode({ changes: { height: 300, layoutMode: LayoutMode.horizontal, width: 400 }, id: parentId }));

    const childId = addFrameNode(20, 20);

    nestFrame(childId, parentId);
    store.dispatch(setSelection([childId]));

    // before
    const { rerender, result } = renderUseColumnPosition();

    // action
    act(() => result.current.onToggleIgnoreAutoLayout());
    rerender();

    // result
    expect(selectActivePage(store.getState()).nodes[childId]).toMatchObject({ ignoreAutoLayout: true });
    expect(result.current.ignoresAutoLayout).toBe(true);

    // action
    act(() => result.current.onToggleIgnoreAutoLayout());
    rerender();

    // result
    expect((selectActivePage(store.getState()).nodes[childId] as { ignoreAutoLayout?: boolean }).ignoreAutoLayout).toBeUndefined();
  });

  it('should disable an axis with an alignment while still reporting its real coordinate', () => {
    // mock
    const parentId = addFrameNode(0, 0);

    store.dispatch(updateNode({ changes: { height: 300, width: 400 }, id: parentId }));

    const childId = addFrameNode(20, 20);

    nestFrame(childId, parentId);
    store.dispatch(updateNode({ changes: { alignment: { horizontal: AlignmentHorizontal.center } }, id: childId }));
    store.dispatch(setSelection([childId]));

    // before
    const { result } = renderUseColumnPosition();

    // result — setting the constraint alone never moves the child; x is still its real local position
    expect(result.current.disabledX).toBe(true);
    expect(result.current.disabledY).toBe(false);
    expect(result.current.x).toBe(20);
  });

  it('should coalesce every scrub between onDragStart and onDragEnd into a single undo step', () => {
    // mock
    const frameId = addFrameNode(10, 20);

    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderUseColumnPosition();

    // action
    act(() => {
      result.current.onDragStart();
      result.current.onScrubX(100);
      result.current.onScrubX(200);
      result.current.onScrubX(300);
      result.current.onDragEnd();
    });

    expect(readNode(frameId).x).toBe(300);

    // action
    store.dispatch(undo());

    // result
    expect(readNode(frameId).x).toBe(10);
  });
});
