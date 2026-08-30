// store
import { addNode, groupNodes, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { undo } from 'store/history/actions';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TGroupNode } from 'types/design/types';

// utils
import { handlePasteToReplace } from '../handlePasteToReplace';
import { setClipboardNodes } from '../clipboard';

const addFrameNode = (overrides: { x?: number; y?: number } = {}): string => {
  store.dispatch(
    addNode({
      fill: '#ff0000',
      height: 20,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
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
      fillColor: null,
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

describe('handlePasteToReplace', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    setClipboardNodes([], []);
  });

  it("should overwrite the selected target's content but keep its own id, position, and slot in rootOrder", () => {
    // mock — the clipboard copy is a 40x40 frame at (0, 0); the target sits at (5, 5)
    const sourceId = addFrameNode({ x: 0, y: 0 });
    const sourceNode = selectActivePage(store.getState()).nodes[sourceId] as TFrameNode;
    setClipboardNodes([{ ...sourceNode, height: 40, width: 40 }], [sourceId]);

    const targetId = addFrameNode({ x: 5, y: 5 });
    const rootOrderBefore = selectActivePage(store.getState()).rootOrder;
    store.dispatch(setSelection([targetId]));

    // action
    handlePasteToReplace(store.dispatch);

    // result — same id and slot, position untouched, size taken from the clipboard copy
    const page = selectActivePage(store.getState());
    expect(page.nodes[targetId]).toMatchObject({ height: 40, id: targetId, width: 40, x: 5, y: 5 });
    expect(page.rootOrder).toEqual(rootOrderBefore);
  });

  it("should cascade-delete a replaced group's old children and install the clipboard copy's own children instead", () => {
    // mock — group the two originals, copy a fresh single frame, then replace the group with it
    const a = addFrameNode({ x: 0, y: 0 });
    const b = addFrameNode({ x: 40, y: 0 });
    store.dispatch(setSelection([a, b]));
    store.dispatch(groupNodes());
    const [groupId] = selectActivePage(store.getState()).selectedIds;
    const oldGroup = selectActivePage(store.getState()).nodes[groupId] as TGroupNode;

    const leafId = addFrameNode({ x: 100, y: 100 });
    const leafNode = selectActivePage(store.getState()).nodes[leafId];
    setClipboardNodes([leafNode], [leafId]);
    store.dispatch(setSelection([groupId]));

    // action
    handlePasteToReplace(store.dispatch);

    // result — the group id now holds a frame, and its old children are gone
    const page = selectActivePage(store.getState());
    expect(page.nodes[groupId]).toMatchObject({ id: groupId, type: NodeType.frame });
    oldGroup.childIds.forEach((childId) => expect(page.nodes[childId]).toBeUndefined());

    // result — deleting the group's last child must not also prune the group's own rootOrder slot out
    // from under the node that just replaced it (pruneParentGroup deletes a now-empty parent group)
    expect(page.rootOrder).toContain(groupId);
  });

  it('should replace a copied group into a leaf target, adding fresh children parented to the same target id', () => {
    // mock — copy a group of two frames, then replace an unrelated leaf with it
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
    handlePasteToReplace(store.dispatch);

    // result
    const page = selectActivePage(store.getState());
    const newRoot = page.nodes[targetId] as TGroupNode;
    expect(newRoot.type).toBe(NodeType.group);
    expect(newRoot.childIds).toHaveLength(2);
    newRoot.childIds.forEach((childId) => {
      expect(page.nodes[childId]).toBeDefined();
      expect(page.nodes[childId].parentId).toBe(targetId);
      expect(page.rootOrder).not.toContain(childId);
    });

    // after
    store.dispatch(setSelection([groupId]));
  });

  it('should replace every selected target with its own independent copy when the clipboard holds a single node', () => {
    // mock
    const sourceId = addFrameNode({ x: 0, y: 0 });
    const sourceNode = selectActivePage(store.getState()).nodes[sourceId] as TFrameNode;
    setClipboardNodes([{ ...sourceNode, height: 99 }], [sourceId]);

    const targetA = addFrameNode({ x: 10, y: 10 });
    const targetB = addFrameNode({ x: 20, y: 20 });
    store.dispatch(setSelection([targetA, targetB]));

    // action
    handlePasteToReplace(store.dispatch);

    // result — each target kept its own position, both got the clipboard copy's height
    const page = selectActivePage(store.getState());
    expect(page.nodes[targetA]).toMatchObject({ height: 99, x: 10, y: 10 });
    expect(page.nodes[targetB]).toMatchObject({ height: 99, x: 20, y: 20 });
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
    handlePasteToReplace(store.dispatch);

    // result
    const after = selectActivePage(store.getState());
    expect(after.nodes[targetA]).toMatchObject({ height: 11 });
    expect(after.nodes[targetB]).toMatchObject({ height: 22 });
  });

  it('should do nothing when the clipboard root count matches neither one root-for-all nor a 1:1 pairing', () => {
    // mock — 2 clipboard roots, 3 selected targets
    const clipA = addFrameNode();
    const clipB = addFrameNode();
    const page = selectActivePage(store.getState());
    setClipboardNodes([page.nodes[clipA], page.nodes[clipB]], [clipA, clipB]);

    const targetA = addFrameNode();
    const targetB = addFrameNode();
    const targetC = addFrameNode();
    store.dispatch(setSelection([targetA, targetB, targetC]));
    const before = selectActivePage(store.getState()).nodes[targetA];

    // action
    handlePasteToReplace(store.dispatch);

    // result — untouched
    expect(selectActivePage(store.getState()).nodes[targetA]).toEqual(before);
  });

  it('should do nothing when the clipboard is empty', () => {
    // mock
    const targetId = addFrameNode();
    store.dispatch(setSelection([targetId]));
    const before = selectActivePage(store.getState()).nodes[targetId];

    // action
    handlePasteToReplace(store.dispatch);

    // result
    expect(selectActivePage(store.getState()).nodes[targetId]).toEqual(before);
  });

  it('should do nothing when nothing is selected', () => {
    // mock
    const sourceId = addFrameNode();
    setClipboardNodes([selectActivePage(store.getState()).nodes[sourceId]], [sourceId]);
    const nodeCountBefore = Object.keys(selectActivePage(store.getState()).nodes).length;

    // action
    handlePasteToReplace(store.dispatch);

    // result
    expect(Object.keys(selectActivePage(store.getState()).nodes)).toHaveLength(nodeCountBefore);
  });

  it('should skip a target that has no plain x/y anchor, such as a vector node', () => {
    // mock
    const sourceId = addFrameNode();
    setClipboardNodes([selectActivePage(store.getState()).nodes[sourceId]], [sourceId]);

    const vectorId = addVectorNode();
    store.dispatch(setSelection([vectorId]));
    const before = selectActivePage(store.getState()).nodes[vectorId];

    // action
    handlePasteToReplace(store.dispatch);

    // result
    expect(selectActivePage(store.getState()).nodes[vectorId]).toEqual(before);
  });

  it('should be undoable as a single step even though it replaces multiple targets', () => {
    // mock
    const sourceId = addFrameNode({ x: 0, y: 0 });
    setClipboardNodes([selectActivePage(store.getState()).nodes[sourceId]], [sourceId]);

    const targetA = addFrameNode({ x: 10, y: 10 });
    const targetB = addFrameNode({ x: 20, y: 20 });
    store.dispatch(setSelection([targetA, targetB]));
    const before = selectActivePage(store.getState()).nodes;

    // action
    handlePasteToReplace(store.dispatch);
    store.dispatch(undo());

    // result
    expect(selectActivePage(store.getState()).nodes).toEqual(before);
  });
});
