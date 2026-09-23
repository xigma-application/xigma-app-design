// store
import { addNode, addNodes, createMaskGroup, groupNodes, setSelection, setVectorEditingNodeIds, updateNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { undo } from 'store/history/actions';
import { store } from 'store';

// types
import { LayoutMode, NodeType } from 'types/design/enums';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { handleNudgeSelection } from '../handleNudgeSelection';

let seq = 0;

const node = (id: string): any => store.getState().design.pages[store.getState().design.activePageId].nodes[id];

const addLooseRect = (x: number, y: number): string => {
  store.dispatch(
    addNode({
      fill: '#000',
      height: 20,
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: 20,
      x,
      y,
    } as any),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const addGroupOfTwo = (make: () => void): { childIds: [string, string]; groupId: string } => {
  const a = addLooseRect(10, 10);
  const b = addLooseRect(60, 40);

  store.dispatch(setSelection([a, b]));
  make();

  return { childIds: [a, b], groupId: node(a).parentId };
};

const addFrameWithChild = (options: { childAbsolute?: boolean; layoutMode?: LayoutMode } = {}): { childId: string; frameId: string } => {
  seq += 1;
  const frameId = `nudge-frame-${seq}`;
  const childId = `nudge-child-${seq}`;

  store.dispatch(
    addNodes({
      nodes: [
        {
          childIds: [childId],
          clipContent: true,
          fill: '#fff',
          height: 200,
          id: frameId,
          layoutMode: options.layoutMode,
          name: 'Frame',
          parentId: null,
          rotation: 0,
          type: NodeType.frame,
          width: 200,
          x: 0,
          y: 0,
        },
        {
          fill: '#000',
          height: 20,
          id: childId,
          ...(options.childAbsolute && { ignoreAutoLayout: true }),
          name: 'Rectangle',
          parentId: frameId,
          rotation: 0,
          type: NodeType.rectangle,
          width: 20,
          x: 50,
          y: 50,
        },
      ] as any,
      rootIds: [frameId],
    }),
  );

  return { childId, frameId };
};

const addAnchoredGridFrameWithChildren = (): { childIdA: string; childIdB: string; frameId: string } => {
  seq += 1;

  const frameId = `nudge-grid-frame-${seq}`;
  const childIdA = `nudge-grid-child-a-${seq}`;
  const childIdB = `nudge-grid-child-b-${seq}`;

  store.dispatch(
    addNodes({
      nodes: [
        {
          childIds: [childIdA, childIdB],
          clipContent: true,
          fill: '#fff',
          gridAutoPlacement: false,
          gridColumnCount: 3,
          gridRowCount: 2,
          height: 200,
          id: frameId,
          layoutMode: LayoutMode.grid,
          name: 'Frame',
          parentId: null,
          rotation: 0,
          type: NodeType.frame,
          width: 200,
          x: 0,
          y: 0,
        },
        {
          fill: '#000',
          gridColumnAnchorIndex: 0,
          gridRowAnchorIndex: 0,
          height: 20,
          id: childIdA,
          name: 'Rectangle',
          parentId: frameId,
          rotation: 0,
          type: NodeType.rectangle,
          width: 20,
          x: 0,
          y: 0,
        },
        {
          fill: '#000',
          gridColumnAnchorIndex: 1,
          gridRowAnchorIndex: 0,
          height: 20,
          id: childIdB,
          name: 'Rectangle',
          parentId: frameId,
          rotation: 0,
          type: NodeType.rectangle,
          width: 20,
          x: 20,
          y: 0,
        },
      ] as any,
      rootIds: [frameId],
    }),
  );

  return { childIdA, childIdB, frameId };
};

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

describe('handleNudgeSelection', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should shift every selected node by the given delta', () => {
    // mock
    const frameId = addFrameNode(10, 10);

    store.dispatch(setSelection([frameId]));

    // action
    handleNudgeSelection(store.dispatch, createCanvasRefs(), -1, 10);

    // result
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[frameId]).toMatchObject({ x: 9, y: 20 });
  });

  it('should update the distance guide against the currently hovered node when nudged with Alt held', () => {
    // mock — a nudged 20x20 frame and an unrelated 20x20 target 30px to its right
    const frameId = addFrameNode(0, 0);
    const targetId = addFrameNode(50, 0);

    store.dispatch(setSelection([frameId]));

    const canvasRefs = createCanvasRefs();

    canvasRefs.hover.hoverRef.current = targetId;

    // action — nudge right by 1, closing the gap from 30 to 29
    handleNudgeSelection(store.dispatch, canvasRefs, 1, 0, true);

    // result
    expect(canvasRefs.transform.distanceGuidesRef.current?.lines).toEqual([{ dashed: false, x1: 21, x2: 50, y1: 10, y2: 10 }]);
  });

  it('should not touch the distance guide ref when nudged without Alt held', () => {
    // mock
    const frameId = addFrameNode(0, 0);
    const targetId = addFrameNode(50, 0);

    store.dispatch(setSelection([frameId]));

    const canvasRefs = createCanvasRefs();

    canvasRefs.hover.hoverRef.current = targetId;

    // action
    handleNudgeSelection(store.dispatch, canvasRefs, 1, 0);

    // result
    expect(canvasRefs.transform.distanceGuidesRef.current).toBeNull();
  });

  it('should be undoable as a single step even with multiple selected nodes', () => {
    // mock
    const frameIdA = addFrameNode(0, 0);
    const frameIdB = addFrameNode(100, 100);

    store.dispatch(setSelection([frameIdA, frameIdB]));

    // action
    handleNudgeSelection(store.dispatch, createCanvasRefs(), 1, 1);
    store.dispatch(undo());

    // result
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[frameIdA]).toMatchObject({ x: 0, y: 0 });
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[frameIdB]).toMatchObject({ x: 100, y: 100 });
  });

  it('should do nothing when nothing is selected', () => {
    // mock
    const frameId = addFrameNode(10, 10);

    // action
    handleNudgeSelection(store.dispatch, createCanvasRefs(), 1, 1);

    // result
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[frameId]).toMatchObject({ x: 10, y: 10 });
  });

  it('should do nothing while a vector node is open for editing', () => {
    // mock
    const frameId = addFrameNode(10, 10);

    store.dispatch(setSelection([frameId]));
    store.dispatch(setVectorEditingNodeIds([frameId]));

    // action
    handleNudgeSelection(store.dispatch, createCanvasRefs(), 1, 1);

    // result
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[frameId]).toMatchObject({ x: 10, y: 10 });
  });

  it('should nudge a freeform-frame child (not just top-level nodes)', () => {
    // mock
    const { childId } = addFrameWithChild();

    store.dispatch(setSelection([childId]));

    // action
    handleNudgeSelection(store.dispatch, createCanvasRefs(), 5, 7);

    // result
    expect(node(childId)).toMatchObject({ x: 55, y: 57 });
  });

  it('should nudge an absolute (ignoreAutoLayout) child of an auto-layout frame', () => {
    // mock
    const { childId } = addFrameWithChild({ childAbsolute: true, layoutMode: LayoutMode.horizontal });

    store.dispatch(setSelection([childId]));

    // action
    handleNudgeSelection(store.dispatch, createCanvasRefs(), 5, 7);

    // result
    expect(node(childId)).toMatchObject({ x: 55, y: 57 });
  });

  it('should not nudge a plain flow child of an auto-layout frame — the engine owns its position', () => {
    // mock
    const { childId } = addFrameWithChild({ layoutMode: LayoutMode.horizontal });

    store.dispatch(setSelection([childId]));
    const before = { x: node(childId).x, y: node(childId).y };

    // action
    handleNudgeSelection(store.dispatch, createCanvasRefs(), 5, 7);

    // result
    expect(node(childId)).toMatchObject(before);
  });

  it('should move a selected group together with every child, not just the group box', () => {
    // mock
    const { childIds, groupId } = addGroupOfTwo(() => store.dispatch(groupNodes()));
    const before = childIds.map((id) => ({ x: node(id).x, y: node(id).y }));

    store.dispatch(setSelection([groupId]));

    // action
    handleNudgeSelection(store.dispatch, createCanvasRefs(), 5, 7);

    // result — both children rode the nudge, and the group box followed
    expect(node(childIds[0])).toMatchObject({ x: before[0].x + 5, y: before[0].y + 7 });
    expect(node(childIds[1])).toMatchObject({ x: before[1].x + 5, y: before[1].y + 7 });
    expect(node(groupId)).toMatchObject({ x: node(childIds[0]).x, y: node(childIds[0]).y });
  });

  it('should move a selected mask group together with every child', () => {
    // mock
    const { childIds, groupId } = addGroupOfTwo(() => store.dispatch(createMaskGroup()));
    const before = childIds.map((id) => ({ x: node(id).x, y: node(id).y }));

    store.dispatch(setSelection([groupId]));

    // action
    handleNudgeSelection(store.dispatch, createCanvasRefs(), -3, 4);

    // result
    expect(node(childIds[0])).toMatchObject({ x: before[0].x - 3, y: before[0].y + 4 });
    expect(node(childIds[1])).toMatchObject({ x: before[1].x - 3, y: before[1].y + 4 });
  });

  it('should move a selection of anchored grid children by one grid slot instead of nudging pixels', () => {
    // mock
    const { childIdA, frameId } = addAnchoredGridFrameWithChildren();

    store.dispatch(setSelection([childIdA]));
    const before = { x: node(childIdA).x, y: node(childIdA).y };

    // action
    handleNudgeSelection(store.dispatch, createCanvasRefs(), 0, 1);

    // result — the grid anchor moved down a row, not a plain pixel-nudge of x/y
    expect(node(childIdA)).toMatchObject({ gridColumnAnchorIndex: 0, gridRowAnchorIndex: 1 });
    expect(node(frameId)).toBeTruthy();
    expect(node(childIdA).y).not.toBe(before.y);
  });

  it('should fall back to the pixel-nudge path when the selection mixes a grid child with a non-grid-managed node', () => {
    // mock — childIdA is a real grid-managed child, childIdB was force-detached via ignoreAutoLayout,
    // so the selection is no longer "entirely grid children of one anchored grid frame"
    const { childIdA, childIdB } = addAnchoredGridFrameWithChildren();

    store.dispatch(updateNode({ changes: { ignoreAutoLayout: true }, id: childIdB }));
    store.dispatch(setSelection([childIdA, childIdB]));

    // action
    handleNudgeSelection(store.dispatch, createCanvasRefs(), 0, 1);

    // result — the grid-managed child is skipped entirely (as it already is today, pre-feature),
    // while the ignoreAutoLayout node still gets the plain pixel nudge
    expect(node(childIdA)).toMatchObject({ gridColumnAnchorIndex: 0, gridRowAnchorIndex: 0 });
    expect(node(childIdB)).toMatchObject({ y: 1 });
  });
});
