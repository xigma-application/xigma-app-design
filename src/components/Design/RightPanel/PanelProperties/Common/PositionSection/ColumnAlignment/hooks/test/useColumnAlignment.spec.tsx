import { Provider } from 'react-redux';
import { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';

// hooks
import { useColumnAlignment } from '../useColumnAlignment';

// store
import { addNode, moveNodes, setSelection, updateNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';
import { undo } from 'store/history/actions';

// types
import { AlignmentHorizontal, AlignmentVertical, LayoutMode, NodeType } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const renderUseColumnAlignment = (): ReturnType<typeof renderHook<ReturnType<typeof useColumnAlignment>, unknown>> =>
  renderHook(() => useColumnAlignment(), { wrapper });

const addFrame = (parentId: string | null, width = 40, height = 40, layoutMode?: LayoutMode): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
      height,
      layoutMode,
      name: 'Frame',
      parentId,
      rotation: 0,
      type: NodeType.frame,
      width,
      x: 0,
      y: 0,
    }),
  );

  return selectActivePage(store.getState()).rootOrder.at(-1) as string;
};

const alignmentOf = (id: string): TFrameNode['alignment'] => (selectActivePage(store.getState()).nodes[id] as TFrameNode).alignment;
const positionOf = (id: string): { x: number; y: number } => {
  const node = selectActivePage(store.getState()).nodes[id] as TFrameNode;

  return { x: node.x, y: node.y };
};

describe('useColumnAlignment', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  // a 400x300 parent with a 40x40 child, so anchor math has a clean expected answer
  const nested = (): { childId: string; parentId: string } => {
    const parentId = addFrame(null, 400, 300);
    const childId = addFrame(null, 40, 40);

    store.dispatch(moveNodes({ nodeIds: [childId], targetIndex: 0, targetParentId: parentId }));
    store.dispatch(setSelection([childId]));

    return { childId, parentId };
  };

  it('should be disabled when the selected frame has no parent', () => {
    store.dispatch(setSelection([addFrame(null)]));

    expect(renderUseColumnAlignment().result.current.disabled).toBe(true);
  });

  // a top-level 400x300 free-form frame holding a 40x40 and a 100x60 child, both at (10, 20)
  const frameWithChildren = (layoutMode?: LayoutMode): { firstId: string; frameId: string; secondId: string } => {
    const frameId = addFrame(null, 400, 300, layoutMode);
    const firstId = addFrame(null, 40, 40);
    const secondId = addFrame(null, 100, 60);

    store.dispatch(moveNodes({ nodeIds: [firstId, secondId], targetIndex: 0, targetParentId: frameId }));
    store.dispatch(updateNode({ changes: { x: 10, y: 20 }, id: firstId }));
    store.dispatch(updateNode({ changes: { x: 10, y: 20 }, id: secondId }));
    store.dispatch(setSelection([frameId]));

    return { firstId, frameId, secondId };
  };

  it('should not be disabled for a top-level free-form frame with children', () => {
    frameWithChildren();

    expect(renderUseColumnAlignment().result.current.disabled).toBe(false);
  });

  it('should align every child of a top-level free-form frame on its own, keeping the other axis', () => {
    const { firstId, frameId, secondId } = frameWithChildren();
    const { result } = renderUseColumnAlignment();

    act(() => result.current.onSelectHorizontal(AlignmentHorizontal.right));

    expect(positionOf(firstId)).toEqual({ x: 400 - 40, y: 20 });
    expect(positionOf(secondId)).toEqual({ x: 400 - 100, y: 20 });
    expect(alignmentOf(firstId)).toEqual({ horizontal: AlignmentHorizontal.right });
    expect(alignmentOf(secondId)).toEqual({ horizontal: AlignmentHorizontal.right });
    expect(positionOf(frameId)).toEqual({ x: 0, y: 0 });
  });

  it("should align every child vertically and keep each child's horizontal constraint", () => {
    const { firstId, secondId } = frameWithChildren();
    const { result } = renderUseColumnAlignment();

    act(() => result.current.onSelectHorizontal(AlignmentHorizontal.left));
    act(() => result.current.onSelectVertical(AlignmentVertical.bottom));

    expect(positionOf(firstId)).toEqual({ x: 0, y: 300 - 40 });
    expect(positionOf(secondId)).toEqual({ x: 0, y: 300 - 60 });
    expect(alignmentOf(firstId)).toEqual({ horizontal: AlignmentHorizontal.left, vertical: AlignmentVertical.bottom });
  });

  it('should undo aligning all children in a single step', () => {
    const { firstId, secondId } = frameWithChildren();
    const { result } = renderUseColumnAlignment();

    act(() => result.current.onSelectHorizontal(AlignmentHorizontal.center));
    act(() => {
      store.dispatch(undo());
    });

    expect(positionOf(firstId)).toEqual({ x: 10, y: 20 });
    expect(positionOf(secondId)).toEqual({ x: 10, y: 20 });
  });

  it('should align a nested free-form frame with children inside its own parent, not its children', () => {
    const { firstId, frameId } = frameWithChildren();
    const outerId = addFrame(null, 800, 600);

    store.dispatch(moveNodes({ nodeIds: [frameId], targetIndex: 0, targetParentId: outerId }));
    store.dispatch(setSelection([frameId]));

    const { result } = renderUseColumnAlignment();
    const childBefore = positionOf(firstId);

    act(() => result.current.onSelectHorizontal(AlignmentHorizontal.right));

    expect(alignmentOf(frameId)).toEqual({ horizontal: AlignmentHorizontal.right });
    expect(positionOf(frameId).x).toBe(800 - 400);
    expect(positionOf(firstId).x - positionOf(frameId).x).toBe(childBefore.x);
  });

  it('should show the distribute menu for a free-form frame with children, nested or not', () => {
    const { frameId } = frameWithChildren();
    const outerId = addFrame(null, 800, 600);

    expect(renderUseColumnAlignment().result.current.showDistribute).toBe(true);

    store.dispatch(moveNodes({ nodeIds: [frameId], targetIndex: 0, targetParentId: outerId }));
    store.dispatch(setSelection([frameId]));

    expect(renderUseColumnAlignment().result.current.showDistribute).toBe(true);
  });

  it('should hide the distribute menu and stay disabled for a top-level auto-layout frame with children', () => {
    frameWithChildren(LayoutMode.vertical);
    const { result } = renderUseColumnAlignment();

    expect(result.current.showDistribute).toBe(false);
    expect(result.current.disabled).toBe(true);
  });

  it('should hide the distribute menu for a frame without children', () => {
    store.dispatch(setSelection([addFrame(null)]));

    expect(renderUseColumnAlignment().result.current.showDistribute).toBe(false);
  });

  describe('multi-selection', () => {
    // top-level frames at the given x/y, each sized as given
    const placedFrame = (x: number, y: number, width: number, height: number, layoutMode?: LayoutMode): string => {
      const id = addFrame(null, width, height, layoutMode);

      store.dispatch(updateNode({ changes: { x, y }, id }));

      return id;
    };

    it("should align every selected top-level frame to the selection's left edge", () => {
      const firstId = placedFrame(100, 0, 40, 40);
      const secondId = placedFrame(300, 200, 80, 60);

      store.dispatch(setSelection([firstId, secondId]));

      const { result } = renderUseColumnAlignment();

      act(() => result.current.onSelectHorizontal(AlignmentHorizontal.left));

      expect(positionOf(firstId)).toEqual({ x: 100, y: 0 });
      expect(positionOf(secondId)).toEqual({ x: 100, y: 200 });
    });

    it("should center every selected frame on the selection's vertical center line without writing constraints", () => {
      const firstId = placedFrame(0, 0, 40, 40);
      const secondId = placedFrame(0, 100, 40, 100);

      store.dispatch(setSelection([firstId, secondId]));

      const { result } = renderUseColumnAlignment();

      act(() => result.current.onSelectVertical(AlignmentVertical.center));

      expect(positionOf(firstId).y).toBe(100 - 20);
      expect(positionOf(secondId).y).toBe(100 - 50);
      expect(alignmentOf(firstId)).toBeUndefined();
    });

    it('should move a selected frame together with its children instead of aligning the children', () => {
      const { firstId: childId, frameId } = frameWithChildren();
      const otherId = placedFrame(600, 0, 40, 40);

      store.dispatch(setSelection([frameId, otherId]));

      const { result } = renderUseColumnAlignment();

      act(() => result.current.onSelectHorizontal(AlignmentHorizontal.right));

      expect(positionOf(frameId).x).toBe(640 - 400);
      expect(positionOf(childId)).toEqual({ x: 240 + 10, y: 20 });
      expect(result.current.showDistribute).toBe(false);
    });

    it("should align each parent's selected children only against each other", () => {
      const { childId: leftChildId, parentId: leftParentId } = nested();
      const { childId: rightChildId } = nested();
      const siblingId = addFrame(null, 40, 40);

      store.dispatch(moveNodes({ nodeIds: [siblingId], targetIndex: 0, targetParentId: leftParentId }));
      store.dispatch(updateNode({ changes: { x: 100 }, id: siblingId }));
      store.dispatch(setSelection([leftChildId, siblingId, rightChildId]));

      const rightBefore = positionOf(rightChildId);
      const { result } = renderUseColumnAlignment();

      act(() => result.current.onSelectHorizontal(AlignmentHorizontal.right));

      expect(positionOf(leftChildId).x).toBe(100);
      expect(positionOf(siblingId).x).toBe(100);
      expect(positionOf(rightChildId)).toEqual(rightBefore);
    });

    it('should leave auto-layout children in place and be disabled when no parent group has two movable layers', () => {
      const parentId = addFrame(null, 400, 300, LayoutMode.horizontal);
      const firstId = addFrame(null, 40, 40);
      const secondId = addFrame(null, 40, 40);

      store.dispatch(moveNodes({ nodeIds: [firstId, secondId], targetIndex: 0, targetParentId: parentId }));
      store.dispatch(setSelection([firstId, secondId]));

      expect(renderUseColumnAlignment().result.current.disabled).toBe(true);
    });

    it('should undo aligning the whole selection in a single step', () => {
      const firstId = placedFrame(100, 0, 40, 40);
      const secondId = placedFrame(300, 200, 80, 60);

      store.dispatch(setSelection([firstId, secondId]));

      const { result } = renderUseColumnAlignment();

      act(() => result.current.onSelectHorizontal(AlignmentHorizontal.center));
      act(() => {
        store.dispatch(undo());
      });

      expect(positionOf(firstId)).toEqual({ x: 100, y: 0 });
      expect(positionOf(secondId)).toEqual({ x: 300, y: 200 });
    });
  });

  it('should be disabled when the parent uses auto layout and the child does not ignore it', () => {
    const parentId = addFrame(null, 400, 300, LayoutMode.horizontal);
    const childId = addFrame(null, 40, 40);

    store.dispatch(moveNodes({ nodeIds: [childId], targetIndex: 0, targetParentId: parentId }));
    store.dispatch(setSelection([childId]));

    expect(renderUseColumnAlignment().result.current.disabled).toBe(true);
  });

  it('should not be disabled when the parent uses auto layout but the child ignores it', () => {
    const parentId = addFrame(null, 400, 300, LayoutMode.horizontal);
    const childId = addFrame(null, 40, 40);

    store.dispatch(moveNodes({ nodeIds: [childId], targetIndex: 0, targetParentId: parentId }));
    store.dispatch(updateNode({ changes: { ignoreAutoLayout: true }, id: childId }));
    store.dispatch(setSelection([childId]));

    expect(renderUseColumnAlignment().result.current.disabled).toBe(false);
  });

  it('should set the constraint and move the child to the anchor', () => {
    const { childId } = nested();
    const { result } = renderUseColumnAlignment();

    act(() => result.current.onSelectHorizontal(AlignmentHorizontal.center));

    expect(alignmentOf(childId)).toEqual({ horizontal: AlignmentHorizontal.center });
    expect(positionOf(childId).x).toBe((400 - 40) / 2);
  });

  it('should stay at the anchor (idempotent) on a repeated identical select', () => {
    const { childId } = nested();
    const { result } = renderUseColumnAlignment();

    act(() => result.current.onSelectHorizontal(AlignmentHorizontal.right));
    act(() => result.current.onSelectHorizontal(AlignmentHorizontal.right));

    expect(alignmentOf(childId)).toEqual({ horizontal: AlignmentHorizontal.right });
    expect(positionOf(childId).x).toBe(400 - 40);
  });

  it('should keep the other axis when setting one', () => {
    const { childId } = nested();
    const { result } = renderUseColumnAlignment();

    act(() => result.current.onSelectHorizontal(AlignmentHorizontal.left));
    act(() => result.current.onSelectVertical(AlignmentVertical.bottom));

    expect(alignmentOf(childId)).toEqual({ horizontal: AlignmentHorizontal.left, vertical: AlignmentVertical.bottom });
    expect(positionOf(childId)).toEqual({ x: 0, y: 300 - 40 });
  });

  it('should set an exact value via setHorizontal and clear via undefined, without moving the child', () => {
    const { childId } = nested();
    const { result } = renderUseColumnAlignment();
    const before = positionOf(childId);

    act(() => result.current.setHorizontal(AlignmentHorizontal.right));
    expect(alignmentOf(childId)).toEqual({ horizontal: AlignmentHorizontal.right });
    expect(positionOf(childId)).toEqual(before);

    act(() => result.current.setHorizontal(undefined));
    expect(alignmentOf(childId)).toBeUndefined();
    expect(positionOf(childId)).toEqual(before);
  });

  it('should expose the current alignment values', () => {
    nested();
    const { result } = renderUseColumnAlignment();

    act(() => result.current.setVertical(AlignmentVertical.center));

    expect(result.current.vertical).toBe(AlignmentVertical.center);
    expect(result.current.horizontal).toBeUndefined();
  });

  it('should still record the constraint even when the frame has no parent to move it against', () => {
    const frameId = addFrame(null);

    store.dispatch(setSelection([frameId]));

    const { result } = renderUseColumnAlignment();

    act(() => result.current.onSelectHorizontal(AlignmentHorizontal.center));

    expect(alignmentOf(frameId)).toEqual({ horizontal: AlignmentHorizontal.center });
  });

  it('should be a no-op when nothing is selected', () => {
    const { result } = renderUseColumnAlignment();

    expect(() => act(() => result.current.setHorizontal(AlignmentHorizontal.left))).not.toThrow();
  });

  // a grid parent + a plain child, so onSelectHorizontal/onSelectVertical route to the grid fields
  const gridChild = (): { childId: string; parentId: string } => {
    const parentId = addFrame(null, 400, 300, LayoutMode.grid);
    const childId = addFrame(null, 40, 40);

    store.dispatch(moveNodes({ nodeIds: [childId], targetIndex: 0, targetParentId: parentId }));
    store.dispatch(setSelection([childId]));

    return { childId, parentId };
  };

  it('should not be disabled for a grid child, unlike a flex auto-layout child', () => {
    gridChild();

    expect(renderUseColumnAlignment().result.current.disabled).toBe(false);
  });

  it('should report a grid child with no default grid align when nothing was explicitly set', () => {
    gridChild();

    const { result } = renderUseColumnAlignment();

    expect(result.current.isGridChild).toBe(true);
    expect(result.current.gridHorizontal).toBeUndefined();
    expect(result.current.gridVertical).toBeUndefined();
  });

  it('should not report a grid child for a non-grid parent', () => {
    nested();

    expect(renderUseColumnAlignment().result.current.isGridChild).toBe(false);
  });

  it('should write gridChildHorizontalAlign/gridChildVerticalAlign for a grid child instead of the alignment constraint', () => {
    const { childId } = gridChild();
    const { result } = renderUseColumnAlignment();

    act(() => result.current.onSelectHorizontal(AlignmentHorizontal.right));
    act(() => result.current.onSelectVertical(AlignmentVertical.bottom));

    const node = selectActivePage(store.getState()).nodes[childId] as TFrameNode;

    expect(node.gridChildHorizontalAlign).toBe(AlignmentHorizontal.right);
    expect(node.gridChildVerticalAlign).toBe(AlignmentVertical.bottom);
    expect(alignmentOf(childId)).toBeUndefined();
    // the grid engine itself repositions the child to the bottom-right of its single 400x300 cell
    // (400 - 40 child width, 300 - 40 child height) — a live consequence of the grid resync, not
    // something this hook writes directly
    expect(positionOf(childId)).toEqual({ x: 360, y: 260 });
  });

  it('should expose the explicit grid align of a grid child', () => {
    const { childId } = gridChild();

    store.dispatch(
      updateNode({
        changes: { gridChildHorizontalAlign: AlignmentHorizontal.center, gridChildVerticalAlign: AlignmentVertical.center },
        id: childId,
      }),
    );

    const { result } = renderUseColumnAlignment();

    expect(result.current.gridHorizontal).toBe(AlignmentHorizontal.center);
    expect(result.current.gridVertical).toBe(AlignmentVertical.center);
  });
});
