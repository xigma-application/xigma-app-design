// store
import { addNode, groupNodes, setSelection, setVectorEditingNodeIds } from 'store/design/slice';
import { selectActivePage, selectSelectedIds } from 'store/design/selectors';
import { undo } from 'store/history/actions';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TGroupNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../useCanvasRefs/createCanvasRefs';
import { handleCopySelection } from '../handleCopySelection';
import { handlePasteSelection } from '../handlePasteSelection';
import { setClipboardNodes } from '../clipboard';
import { setVectorClipboardFragment } from '../vectorClipboard';

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

describe('handlePasteSelection', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeIds([]));
    setClipboardNodes([], []);
    setVectorClipboardFragment({ filledFacePieceKeySets: [], segments: [], vertexHandleModes: {}, vertices: [] });
  });

  it('should add an offset clone of every copied node and select the new clones', () => {
    // mock
    const frameId = addFrameNode();

    store.dispatch(setSelection([frameId]));
    handleCopySelection(createCanvasRefs());
    store.dispatch(setSelection([]));

    // action
    handlePasteSelection(store.dispatch, createCanvasRefs());

    // result
    const { nodes } = selectActivePage(store.getState());
    const selectedIds = selectSelectedIds(store.getState());

    expect(selectedIds).toHaveLength(1);
    expect(selectedIds).not.toEqual([frameId]);

    const pastedNode = nodes[selectedIds[0]];

    expect(pastedNode).toMatchObject({ x: 15, y: 15 });
  });

  it('should paste a copied group as an independent copy with its own cloned children, leaving the original group intact', () => {
    // mock
    const a = addFrameNode({ x: 0, y: 0 });
    const b = addFrameNode({ x: 40, y: 0 });

    store.dispatch(setSelection([a, b]));
    store.dispatch(groupNodes());

    const originalPage = selectActivePage(store.getState());
    const [originalGroupId] = originalPage.selectedIds;
    const originalGroup = originalPage.nodes[originalGroupId] as TGroupNode;

    handleCopySelection(createCanvasRefs());
    store.dispatch(setSelection([]));

    // action
    handlePasteSelection(store.dispatch, createCanvasRefs());

    // result
    const page = selectActivePage(store.getState());
    const selectedIds = selectSelectedIds(store.getState());

    expect(selectedIds).toHaveLength(1);
    const [pastedGroupId] = selectedIds;
    expect(pastedGroupId).not.toBe(originalGroupId);

    const pastedGroup = page.nodes[pastedGroupId] as TGroupNode;
    expect(pastedGroup.type).toBe(NodeType.group);
    expect(pastedGroup.childIds).toHaveLength(2);
    expect(pastedGroup.childIds).not.toEqual(expect.arrayContaining(originalGroup.childIds));

    // every pasted child must exist, be parented to the NEW group, and not appear in rootOrder
    pastedGroup.childIds.forEach((childId) => {
      expect(page.nodes[childId]).toBeDefined();
      expect(page.nodes[childId].parentId).toBe(pastedGroupId);
      expect(page.rootOrder).not.toContain(childId);
    });

    // the original group and its own children are untouched
    expect(page.nodes[originalGroupId]).toEqual(originalGroup);
    originalGroup.childIds.forEach((childId) => {
      expect(page.nodes[childId].parentId).toBe(originalGroupId);
    });

    // the pasted group is the only new entry in rootOrder
    expect(page.rootOrder).toEqual([...originalPage.rootOrder, pastedGroupId]);
  });

  it('should be undoable as a single step even though it dispatches multiple nodes', () => {
    // mock
    const frameId = addFrameNode();

    store.dispatch(setSelection([frameId]));
    handleCopySelection(createCanvasRefs());
    store.dispatch(setSelection([]));

    const nodeCountBeforePaste = Object.keys(store.getState().design.pages[store.getState().design.activePageId].nodes).length;

    // action
    handlePasteSelection(store.dispatch, createCanvasRefs());
    store.dispatch(undo());

    // result
    expect(Object.keys(store.getState().design.pages[store.getState().design.activePageId].nodes)).toHaveLength(nodeCountBeforePaste);
  });

  it('should do nothing when the clipboard is empty', () => {
    // mock
    const nodeCountBeforePaste = Object.keys(store.getState().design.pages[store.getState().design.activePageId].nodes).length;

    // action
    handlePasteSelection(store.dispatch, createCanvasRefs());

    // result
    expect(Object.keys(store.getState().design.pages[store.getState().design.activePageId].nodes)).toHaveLength(nodeCountBeforePaste);
  });

  it('should do nothing while a vector node is open for editing and only a whole-node clipboard was copied', () => {
    // mock
    const frameId = addFrameNode();

    store.dispatch(setSelection([frameId]));
    handleCopySelection(createCanvasRefs());
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeIds([frameId]));

    const nodeCountBeforePaste = Object.keys(store.getState().design.pages[store.getState().design.activePageId].nodes).length;

    // action
    handlePasteSelection(store.dispatch, createCanvasRefs());

    // result
    expect(Object.keys(store.getState().design.pages[store.getState().design.activePageId].nodes)).toHaveLength(nodeCountBeforePaste);
  });

  it('should replace the selected target instead of adding an offset clone when a target is selected', () => {
    // mock — the clipboard copy is a 40x40 frame at (0, 0); the target sits at (5, 5)
    const sourceId = addFrameNode({ x: 0, y: 0 });
    store.dispatch(setSelection([sourceId]));
    handleCopySelection(createCanvasRefs());

    const targetId = addFrameNode({ x: 5, y: 5 });
    const rootOrderBefore = selectActivePage(store.getState()).rootOrder;
    store.dispatch(setSelection([targetId]));

    // action
    handlePasteSelection(store.dispatch, createCanvasRefs());

    // result — same id and slot as the target, no new node added
    const page = selectActivePage(store.getState());
    expect(page.nodes[targetId]).toMatchObject({ id: targetId, x: 5, y: 5 });
    expect(page.rootOrder).toEqual(rootOrderBefore);
    expect(selectSelectedIds(store.getState())).toEqual([targetId]);
  });

  it('should replace every selected target by pairing multiple clipboard roots with multiple selected targets', () => {
    // mock
    const clipA = addFrameNode({ x: 0, y: 0 });
    const clipB = addFrameNode({ x: 0, y: 0 });
    store.dispatch(setSelection([clipA, clipB]));
    handleCopySelection(createCanvasRefs());

    const targetA = addFrameNode({ x: 1, y: 1 });
    const targetB = addFrameNode({ x: 2, y: 2 });
    store.dispatch(setSelection([targetA, targetB]));

    // action
    handlePasteSelection(store.dispatch, createCanvasRefs());

    // result — both targets replaced in place, nothing new added
    const page = selectActivePage(store.getState());
    expect(page.nodes[targetA]).toMatchObject({ x: 1, y: 1 });
    expect(page.nodes[targetB]).toMatchObject({ x: 2, y: 2 });
    expect(selectSelectedIds(store.getState())).toEqual([targetA, targetB]);
  });

  it('should fall back to an offset clone when the selection cannot be paired with the clipboard', () => {
    // mock — 2 clipboard roots, 3 selected targets: neither one-for-all nor a 1:1 pairing
    const clipA = addFrameNode({ x: 0, y: 0 });
    const clipB = addFrameNode({ x: 0, y: 0 });
    store.dispatch(setSelection([clipA, clipB]));
    handleCopySelection(createCanvasRefs());

    const targetA = addFrameNode({ x: 1, y: 1 });
    const targetB = addFrameNode({ x: 2, y: 2 });
    const targetC = addFrameNode({ x: 3, y: 3 });
    store.dispatch(setSelection([targetA, targetB, targetC]));
    const nodeCountBeforePaste = Object.keys(selectActivePage(store.getState()).nodes).length;

    // action
    handlePasteSelection(store.dispatch, createCanvasRefs());

    // result — the targets are untouched and two fresh clones were added instead
    const page = selectActivePage(store.getState());
    expect(page.nodes[targetA]).toMatchObject({ x: 1, y: 1 });
    expect(Object.keys(page.nodes)).toHaveLength(nodeCountBeforePaste + 2);
  });

  it('should paste a copied vector fragment into the open vector node', () => {
    // mock
    const vectorId = addVectorNode();

    store.dispatch(setVectorEditingNodeIds([vectorId]));

    const copyRefs = createCanvasRefs({ vectorEdit: { selectedVectorVertexIdsRef: { current: ['v1'] } } });

    handleCopySelection(copyRefs);

    const pasteRefs = createCanvasRefs();

    // action
    handlePasteSelection(store.dispatch, pasteRefs);

    // result
    const node = store.getState().design.pages[store.getState().design.activePageId].nodes[vectorId] as any;

    expect(Object.keys(node.vertices)).toHaveLength(2);
    expect(pasteRefs.vectorEdit.selectedVectorVertexIdsRef.current).toHaveLength(1);
  });
});
