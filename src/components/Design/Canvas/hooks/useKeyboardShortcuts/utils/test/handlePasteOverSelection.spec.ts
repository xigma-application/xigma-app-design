// store
import { addNode, groupNodes, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { undo } from 'store/history/actions';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TGroupNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../useCanvasRefs/createCanvasRefs';
import { handlePasteOverSelection } from '../handlePasteOverSelection';
import { setClipboardNodes } from '../clipboard';

const addFrameNode = (overrides: { x?: number; y?: number } = {}): string => {
  store.dispatch(
    addNode({
      fill: '#ff0000',
      height: 20,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      childIds: [], clipContent: true, type: NodeType.frame,
      width: 20,
      x: 5,
      y: 5,
      ...overrides,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const addVectorNode = (): string => {
  store.dispatch(
    addNode({
      defaultFill: null,
      filledFaceKeys: [],
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: {},
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { v1: { id: 'v1', x: 0, y: 0 } },
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('handlePasteOverSelection', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    setClipboardNodes([], []);
  });

  it("should add a fresh copy at the target's position, leaving the target itself untouched", () => {
    // mock — the clipboard copy is a 40x40 frame at (0, 0); the target sits at (5, 5)
    const sourceId = addFrameNode({ x: 0, y: 0 });
    const sourceNode = selectActivePage(store.getState()).nodes[sourceId] as TFrameNode;
    setClipboardNodes([{ ...sourceNode, height: 40, width: 40 }], [sourceId]);

    const targetId = addFrameNode({ x: 5, y: 5 });
    const nodeCountBefore = Object.keys(selectActivePage(store.getState()).nodes).length;
    store.dispatch(setSelection([targetId]));

    // action
    handlePasteOverSelection(store.dispatch, createCanvasRefs());

    // result — the target is unchanged, a brand new node landed at its position
    const page = selectActivePage(store.getState());
    expect(page.nodes[targetId]).toMatchObject({ height: 20, width: 20, x: 5, y: 5 });
    expect(Object.keys(page.nodes)).toHaveLength(nodeCountBefore + 1);

    const newNode = Object.values(page.nodes).find((node) => node.id !== targetId && node.id !== sourceId) as TFrameNode;
    expect(newNode).toMatchObject({ height: 40, width: 40, x: 5, y: 5 });
    expect(page.selectedIds).toEqual([newNode.id]);
  });

  it('should paste a copy over every selected target when the clipboard holds a single node', () => {
    // mock
    const sourceId = addFrameNode({ x: 0, y: 0 });
    const sourceNode = selectActivePage(store.getState()).nodes[sourceId] as TFrameNode;
    setClipboardNodes([{ ...sourceNode, height: 99 }], [sourceId]);

    const targetA = addFrameNode({ x: 10, y: 10 });
    const targetB = addFrameNode({ x: 20, y: 20 });
    const nodeCountBefore = Object.keys(selectActivePage(store.getState()).nodes).length;
    store.dispatch(setSelection([targetA, targetB]));

    // action
    handlePasteOverSelection(store.dispatch, createCanvasRefs());

    // result — both targets survive, two new copies landed at their positions
    const page = selectActivePage(store.getState());
    expect(page.nodes[targetA]).toMatchObject({ x: 10, y: 10 });
    expect(page.nodes[targetB]).toMatchObject({ x: 20, y: 20 });
    expect(Object.keys(page.nodes)).toHaveLength(nodeCountBefore + 2);
  });

  it('should pair multiple clipboard roots with multiple selected targets by index', () => {
    // mock
    const clipA = addFrameNode({ x: 0, y: 0 });
    const clipB = addFrameNode({ x: 0, y: 0 });
    const page = selectActivePage(store.getState());
    const nodeA = page.nodes[clipA] as TFrameNode;
    const nodeB = page.nodes[clipB] as TFrameNode;
    setClipboardNodes(
      [
        { ...nodeA, height: 11 },
        { ...nodeB, height: 22 },
      ],
      [clipA, clipB],
    );

    const targetA = addFrameNode({ x: 1, y: 1 });
    const targetB = addFrameNode({ x: 2, y: 2 });
    store.dispatch(setSelection([targetA, targetB]));

    // action
    handlePasteOverSelection(store.dispatch, createCanvasRefs());

    // result
    const after = selectActivePage(store.getState());
    const pastedNodes = after.selectedIds.map((id) => after.nodes[id]);
    expect(pastedNodes).toEqual(
      expect.arrayContaining([expect.objectContaining({ height: 11, x: 1, y: 1 }), expect.objectContaining({ height: 22, x: 2, y: 2 })]),
    );
  });

  it("should cascade an added copy's own children, parented into the same slot as the target", () => {
    // mock — group two originals, copy them, paste over an unrelated leaf target
    const a = addFrameNode({ x: 0, y: 0 });
    const b = addFrameNode({ x: 40, y: 0 });
    store.dispatch(setSelection([a, b]));
    store.dispatch(groupNodes());
    const groupPage = selectActivePage(store.getState());
    const [groupId] = groupPage.selectedIds;
    const group = groupPage.nodes[groupId] as TGroupNode;
    setClipboardNodes([group, ...group.childIds.map((childId) => groupPage.nodes[childId])], [groupId]);

    const targetId = addFrameNode({ x: 500, y: 500 });
    store.dispatch(setSelection([targetId]));

    // action
    handlePasteOverSelection(store.dispatch, createCanvasRefs());

    // result
    const page = selectActivePage(store.getState());
    const [newGroupId] = page.selectedIds;
    const newGroup = page.nodes[newGroupId] as TGroupNode;

    expect(newGroup.type).toBe(NodeType.group);
    expect(newGroup.x).toBe(500);
    expect(newGroup.childIds).toHaveLength(2);
    newGroup.childIds.forEach((childId) => {
      expect(page.nodes[childId]).toBeDefined();
      expect(page.nodes[childId].parentId).toBe(newGroupId);
    });

    // the original target and the original group are both still there, untouched
    expect(page.nodes[targetId]).toMatchObject({ x: 500, y: 500 });
    expect(page.nodes[groupId]).toBeDefined();
  });

  it('should do nothing when the clipboard root count matches neither one-for-all nor a 1:1 pairing', () => {
    // mock — 2 clipboard roots, 3 selected targets
    const clipA = addFrameNode();
    const clipB = addFrameNode();
    const page = selectActivePage(store.getState());
    setClipboardNodes([page.nodes[clipA], page.nodes[clipB]], [clipA, clipB]);

    const targetA = addFrameNode();
    const targetB = addFrameNode();
    const targetC = addFrameNode();
    store.dispatch(setSelection([targetA, targetB, targetC]));
    const nodeCountBefore = Object.keys(selectActivePage(store.getState()).nodes).length;

    // action
    handlePasteOverSelection(store.dispatch, createCanvasRefs());

    // result — untouched
    expect(Object.keys(selectActivePage(store.getState()).nodes)).toHaveLength(nodeCountBefore);
  });

  it('should do nothing when the clipboard is empty', () => {
    // mock
    const targetId = addFrameNode();
    store.dispatch(setSelection([targetId]));
    const nodeCountBefore = Object.keys(selectActivePage(store.getState()).nodes).length;

    // action
    handlePasteOverSelection(store.dispatch, createCanvasRefs());

    // result
    expect(Object.keys(selectActivePage(store.getState()).nodes)).toHaveLength(nodeCountBefore);
  });

  it('should do nothing when nothing is selected', () => {
    // mock
    const sourceId = addFrameNode();
    setClipboardNodes([selectActivePage(store.getState()).nodes[sourceId]], [sourceId]);
    const nodeCountBefore = Object.keys(selectActivePage(store.getState()).nodes).length;

    // action
    handlePasteOverSelection(store.dispatch, createCanvasRefs());

    // result
    expect(Object.keys(selectActivePage(store.getState()).nodes)).toHaveLength(nodeCountBefore);
  });

  it('should skip a target that has no plain x/y anchor, such as a vector node', () => {
    // mock
    const sourceId = addFrameNode();
    setClipboardNodes([selectActivePage(store.getState()).nodes[sourceId]], [sourceId]);

    const vectorId = addVectorNode();
    store.dispatch(setSelection([vectorId]));
    const nodeCountBefore = Object.keys(selectActivePage(store.getState()).nodes).length;

    // action
    handlePasteOverSelection(store.dispatch, createCanvasRefs());

    // result
    expect(Object.keys(selectActivePage(store.getState()).nodes)).toHaveLength(nodeCountBefore);
  });

  it('should be undoable as a single step even though it adds copies for multiple targets', () => {
    // mock
    const sourceId = addFrameNode({ x: 0, y: 0 });
    setClipboardNodes([selectActivePage(store.getState()).nodes[sourceId]], [sourceId]);

    const targetA = addFrameNode({ x: 10, y: 10 });
    const targetB = addFrameNode({ x: 20, y: 20 });
    store.dispatch(setSelection([targetA, targetB]));
    const before = selectActivePage(store.getState()).nodes;

    // action
    handlePasteOverSelection(store.dispatch, createCanvasRefs());
    store.dispatch(undo());

    // result
    expect(selectActivePage(store.getState()).nodes).toEqual(before);
  });
});
