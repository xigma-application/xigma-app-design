import { Provider } from 'react-redux';
import { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';

// hooks
import { useColumnPosition } from '../useColumnPosition';

// store
import { addNode, addNodes, moveNodes, setImageEditor, setSelection, updateNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';
import { undo } from 'store/history/actions';

// types
import { AlignmentHorizontal, LayoutMode, NodeType } from 'types/design/enums';
import { TImagePaint } from 'types/design/paint/types';

// utils
import { makeSquareVector } from 'utils/canvas/vector/stroke/test/fixtures';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const renderUseColumnPosition = (): ReturnType<typeof renderHook<ReturnType<typeof useColumnPosition>, unknown>> =>
  renderHook(() => useColumnPosition(), { wrapper });

const addFrameNode = (x: number, y: number): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
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

const addImageFrameNode = (x: number, y: number, paint: TImagePaint): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fills: [paint],
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

const readCrop = (id: string): TImagePaint['crop'] => {
  const node = selectActivePage(store.getState()).nodes[id] as { fills: TImagePaint[] };

  return node.fills[0].crop;
};

describe('useColumnPosition', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setImageEditor(null));
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

  it('should keep a vector inside an auto layout parent editable, without the ignore-auto-layout toggle', () => {
    // mock
    const parentId = addFrameNode(0, 0);

    store.dispatch(updateNode({ changes: { height: 300, layoutMode: LayoutMode.horizontal, width: 400 }, id: parentId }));
    store.dispatch(addNodes({ nodes: [makeSquareVector({ id: 'position-hook-vector' })], rootIds: ['position-hook-vector'] }));
    nestFrame('position-hook-vector', parentId);
    store.dispatch(setSelection(['position-hook-vector']));

    // before
    const { result } = renderUseColumnPosition();

    // result
    expect(result.current.disabledX).toBe(false);
    expect(result.current.ignoresAutoLayout).toBe(false);
    expect(result.current.showIgnoreAutoLayoutToggle).toBe(false);
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

  it('should expose the image crop’s own x/y instead of the frame’s, when the image is the selected crop target', () => {
    // mock — the frame sits at (0,0), but its image crop was dragged to (5,6)
    const paint: TImagePaint = {
      crop: { height: 15, rotation: 0, width: 15, x: 5, y: 6 },
      opacity: 100,
      ref: 'image-1',
      rotation: 0,
      scaleMode: 'fill',
      type: 'image',
    };
    const frameId = addImageFrameNode(0, 0, paint);

    store.dispatch(setSelection([frameId]));
    store.dispatch(setImageEditor({ mode: 'crop', nodeId: frameId, paintIndex: 0, selectedTarget: 'image' }));

    // before
    const { result } = renderUseColumnPosition();

    // result
    expect(result.current).toMatchObject({ disabledX: false, disabledY: false, x: 5, y: 6 });
  });

  it('should commit a scrubbed position to the crop, leaving the frame’s own x/y untouched', () => {
    // mock
    const paint: TImagePaint = {
      crop: { height: 15, rotation: 0, width: 15, x: 5, y: 6 },
      opacity: 100,
      ref: 'image-1',
      rotation: 0,
      scaleMode: 'fill',
      type: 'image',
    };
    const frameId = addImageFrameNode(0, 0, paint);

    store.dispatch(setSelection([frameId]));
    store.dispatch(setImageEditor({ mode: 'crop', nodeId: frameId, paintIndex: 0, selectedTarget: 'image' }));

    // before
    const { result } = renderUseColumnPosition();

    // action
    act(() => result.current.onScrubX(40));

    // result
    expect(readCrop(frameId)).toEqual({ height: 15, rotation: 0, width: 15, x: 40, y: 6 });
    expect(readNode(frameId)).toEqual({ x: 0, y: 0 });
  });

  describe('multi-selection', () => {
    const blurWith = (value: string): Parameters<ReturnType<typeof useColumnPosition>['onBlurX']>[0] =>
      ({ target: { value } }) as unknown as Parameters<ReturnType<typeof useColumnPosition>['onBlurX']>[0];

    it('should show Mixed for an axis whose values differ and the shared value for the other', () => {
      // mock
      store.dispatch(setSelection([addFrameNode(10, 5), addFrameNode(40, 5)]));

      // before
      const { result } = renderUseColumnPosition();

      // result
      expect(result.current.displayX).toBe('Mixed');
      expect(result.current.displayY).toBe(5);
    });

    it('should set the same typed X on every selected layer, in a single undo step', () => {
      // mock
      const firstId = addFrameNode(10, 5);
      const secondId = addFrameNode(40, 50);
      store.dispatch(setSelection([firstId, secondId]));

      // before
      const { result } = renderUseColumnPosition();

      // action
      act(() => result.current.onBlurX(blurWith('100')));

      // result
      expect(readNode(firstId)).toEqual({ x: 100, y: 5 });
      expect(readNode(secondId)).toEqual({ x: 100, y: 50 });

      // action
      act(() => {
        store.dispatch(undo());
      });

      // result
      expect(readNode(firstId).x).toBe(10);
      expect(readNode(secondId).x).toBe(40);
    });

    it('should move every selected layer by the same scrubbed delta from where it started, keeping the field Mixed', () => {
      // mock
      const firstId = addFrameNode(10, 5);
      const secondId = addFrameNode(40, 5);
      store.dispatch(setSelection([firstId, secondId]));

      // before
      const { result } = renderUseColumnPosition();

      // action
      act(() => result.current.onDragStart());
      act(() => result.current.onScrubX(15));
      act(() => result.current.onScrubX(20));
      act(() => result.current.onDragEnd());

      // result
      expect(readNode(firstId).x).toBe(20);
      expect(readNode(secondId).x).toBe(50);
      expect(result.current.displayX).toBe('Mixed');
    });

    it('should set a typed Y and move by a scrubbed Y delta on every selected layer', () => {
      // mock
      const firstId = addFrameNode(10, 5);
      const secondId = addFrameNode(40, 50);
      store.dispatch(setSelection([firstId, secondId]));

      // before
      const { result } = renderUseColumnPosition();

      // action
      act(() => result.current.onBlurY(blurWith('100')));

      // result
      expect(readNode(firstId).y).toBe(100);
      expect(readNode(secondId).y).toBe(100);

      // action
      act(() => result.current.onDragStart());
      act(() => result.current.onScrubY(110));
      act(() => result.current.onDragEnd());

      // result
      expect(readNode(firstId).y).toBe(110);
      expect(readNode(secondId).y).toBe(110);
    });

    it('should skip a layer whose X is pinned by a constraint', () => {
      // mock
      const parentId = addFrameNode(0, 0);
      const pinnedId = addFrameNode(5, 5);
      const freeId = addFrameNode(200, 5);

      nestFrame(pinnedId, parentId);
      store.dispatch(updateNode({ changes: { alignment: { horizontal: AlignmentHorizontal.left } }, id: pinnedId }));
      store.dispatch(setSelection([pinnedId, freeId]));

      const pinnedBefore = readNode(pinnedId);

      // before
      const { result } = renderUseColumnPosition();

      // action
      act(() => result.current.onBlurX(blurWith('300')));

      // result
      expect(readNode(pinnedId)).toEqual(pinnedBefore);
      expect(readNode(freeId).x).toBe(300);
      expect(result.current.disabledX).toBe(false);
    });
  });
});
