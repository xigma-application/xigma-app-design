// store
import { addNode, groupNodes, moveNodes, setSelection, setVectorEditingNodeIds } from 'store/design/slice';
import { selectActivePage, selectSelectedIds } from 'store/design/selectors';
import { undo } from 'store/history/actions';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TGroupNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../useCanvasRefs/createCanvasRefs';
import { handleDuplicateSelection } from '../handleDuplicateSelection';

const addFrameNode = (overrides: { x?: number; y?: number } = {}): string => {
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

describe('handleDuplicateSelection', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should add an offset clone of every selected node and select the new clones', () => {
    // mock
    const frameId = addFrameNode();

    store.dispatch(setSelection([frameId]));

    // action
    handleDuplicateSelection(store.dispatch, createCanvasRefs());

    // result
    const { nodes } = selectActivePage(store.getState());
    const selectedIds = selectSelectedIds(store.getState());

    expect(selectedIds).toHaveLength(1);
    expect(selectedIds).not.toEqual([frameId]);

    const duplicateNode = nodes[selectedIds[0]];

    expect(duplicateNode).toMatchObject({ x: 15, y: 15 });
  });

  it('should duplicate a group as an independent copy with its own cloned children, leaving the original group intact', () => {
    // mock
    const a = addFrameNode({ x: 0, y: 0 });
    const b = addFrameNode({ x: 40, y: 0 });

    store.dispatch(setSelection([a, b]));
    store.dispatch(groupNodes());

    const originalPage = selectActivePage(store.getState());
    const [originalGroupId] = originalPage.selectedIds;
    const originalGroup = originalPage.nodes[originalGroupId] as TGroupNode;

    // action
    handleDuplicateSelection(store.dispatch, createCanvasRefs());

    // result
    const page = selectActivePage(store.getState());
    const selectedIds = selectSelectedIds(store.getState());

    expect(selectedIds).toHaveLength(1);
    const [duplicateGroupId] = selectedIds;
    expect(duplicateGroupId).not.toBe(originalGroupId);

    const duplicateGroup = page.nodes[duplicateGroupId] as TGroupNode;
    expect(duplicateGroup.type).toBe(NodeType.group);
    expect(duplicateGroup.childIds).toHaveLength(2);
    expect(duplicateGroup.childIds).not.toEqual(expect.arrayContaining(originalGroup.childIds));

    duplicateGroup.childIds.forEach((childId) => {
      expect(page.nodes[childId]).toBeDefined();
      expect(page.nodes[childId].parentId).toBe(duplicateGroupId);
      expect(page.rootOrder).not.toContain(childId);
    });

    expect(page.nodes[originalGroupId]).toEqual(originalGroup);
  });

  it('should place the duplicate of a nested node as a sibling under the same parent, right after the original — not at the tree root', () => {
    // mock
    const parentFrameId = addFrameNode({ x: 0, y: 0 });
    const childId = addFrameNode({ x: 2, y: 2 });

    store.dispatch(moveNodes({ nodeIds: [childId], targetIndex: 0, targetParentId: parentFrameId }));
    store.dispatch(setSelection([childId]));

    // action
    handleDuplicateSelection(store.dispatch, createCanvasRefs());

    // result
    const page = selectActivePage(store.getState());
    const [duplicateId] = selectSelectedIds(store.getState());

    expect(duplicateId).not.toBe(childId);
    expect(page.nodes[duplicateId].parentId).toBe(parentFrameId);
    expect(page.rootOrder).not.toContain(duplicateId);
    expect((page.nodes[parentFrameId] as TFrameNode).childIds).toEqual([childId, duplicateId]);
  });

  it('should undo the duplicate of a nested node — including its reparenting — in a single step', () => {
    // mock
    const parentFrameId = addFrameNode({ x: 0, y: 0 });
    const childId = addFrameNode({ x: 2, y: 2 });

    store.dispatch(moveNodes({ nodeIds: [childId], targetIndex: 0, targetParentId: parentFrameId }));
    store.dispatch(setSelection([childId]));

    // action
    handleDuplicateSelection(store.dispatch, createCanvasRefs());
    store.dispatch(undo());

    // result
    const page = selectActivePage(store.getState());

    expect((page.nodes[parentFrameId] as TFrameNode).childIds).toEqual([childId]);
    expect(selectSelectedIds(store.getState())).toEqual([childId]);
  });

  it('should keep each nested sibling duplicate under the shared parent when several are duplicated at once', () => {
    // mock
    const parentFrameId = addFrameNode({ x: 0, y: 0 });
    const firstChildId = addFrameNode({ x: 2, y: 2 });
    const secondChildId = addFrameNode({ x: 4, y: 4 });

    store.dispatch(moveNodes({ nodeIds: [firstChildId, secondChildId], targetIndex: 0, targetParentId: parentFrameId }));
    store.dispatch(setSelection([firstChildId, secondChildId]));

    // action
    handleDuplicateSelection(store.dispatch, createCanvasRefs());

    // result
    const page = selectActivePage(store.getState());
    const childIds = (page.nodes[parentFrameId] as TFrameNode).childIds;

    expect(childIds).toHaveLength(4);
    expect(page.rootOrder).not.toEqual(expect.arrayContaining(selectSelectedIds(store.getState())));
    childIds.forEach((id) => expect(page.nodes[id].parentId).toBe(parentFrameId));
  });

  it('should be undoable as a single step even though it dispatches multiple nodes and a selection change', () => {
    // mock
    const frameId = addFrameNode();

    store.dispatch(setSelection([frameId]));

    const nodeCountBeforeDuplicate = Object.keys(store.getState().design.pages[store.getState().design.activePageId].nodes).length;

    // action
    handleDuplicateSelection(store.dispatch, createCanvasRefs());
    store.dispatch(undo());

    // result
    expect(Object.keys(store.getState().design.pages[store.getState().design.activePageId].nodes)).toHaveLength(nodeCountBeforeDuplicate);
    expect(selectSelectedIds(store.getState())).toEqual([frameId]);
  });

  it('should do nothing when nothing is selected', () => {
    // mock
    addFrameNode();

    const nodeCountBeforeDuplicate = Object.keys(store.getState().design.pages[store.getState().design.activePageId].nodes).length;

    // action
    handleDuplicateSelection(store.dispatch, createCanvasRefs());

    // result
    expect(Object.keys(store.getState().design.pages[store.getState().design.activePageId].nodes)).toHaveLength(nodeCountBeforeDuplicate);
  });

  it('should do nothing while a vector node is open for editing with no vertex/segment selected', () => {
    // mock
    const frameId = addFrameNode();

    store.dispatch(setSelection([frameId]));
    store.dispatch(setVectorEditingNodeIds([frameId]));

    const nodeCountBeforeDuplicate = Object.keys(store.getState().design.pages[store.getState().design.activePageId].nodes).length;

    // action
    handleDuplicateSelection(store.dispatch, createCanvasRefs());

    // result
    expect(Object.keys(store.getState().design.pages[store.getState().design.activePageId].nodes)).toHaveLength(nodeCountBeforeDuplicate);
  });

  it('should duplicate the selected vertex when a vector node is open for editing', () => {
    // mock
    const vectorId = addVectorNode();

    store.dispatch(setVectorEditingNodeIds([vectorId]));

    const refs = createCanvasRefs({ vectorEdit: { selectedVectorVertexIdsRef: { current: ['v1'] } } });

    // action
    handleDuplicateSelection(store.dispatch, refs);

    // result
    const node = store.getState().design.pages[store.getState().design.activePageId].nodes[vectorId] as any;

    expect(Object.keys(node.vertices)).toHaveLength(2);
    expect(refs.vectorEdit.selectedVectorVertexIdsRef.current).toHaveLength(1);
    expect(refs.vectorEdit.selectedVectorVertexIdsRef.current[0]).not.toBe('v1');
  });
});
