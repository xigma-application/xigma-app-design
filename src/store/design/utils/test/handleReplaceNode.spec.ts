// types
import { NodeType, ToolName } from 'types/design/enums';
import { TDesignPage, TDesignState } from '../../types';
import { TFrameNode, TGroupNode, TVectorNode } from 'types/design/types';

// utils
import { getActivePage } from '../getActivePage';
import { handleReplaceNode } from '../handleReplaceNode';

const frameNode: TFrameNode = {
  childIds: [],
  clipContent: true,
  fill: '#ff0000',
  height: 10,
  id: 'node-1',
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 10,
  x: 0,
  y: 0,
};

const vectorNode: TVectorNode = {
  defaultFill: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
  filledFaceKeys: [],
  id: 'node-1',
  name: 'Frame',
  parentId: null,
  rotation: 0,
  segments: {},
  strokeColor: '#000000',
  strokeWidth: 0,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: {},
};

const buildState = (nodes: TDesignPage['nodes']): TDesignState => ({
  activePageId: 'page-1',
  activeTool: ToolName.default,
  areAdditionalLabelsVisible: true,
  areRulersVisible: false,
  commentDraftPosition: null,
  editingNodeId: null,
  editingSelectionChangedAt: 0,
  editingSelectionEnd: 0,
  editingSelectionStart: 0,
  editingTextBox: null,
  editingTextContent: '',
  isActionsPanelOpen: false,
  isMediaToolArmed: false,
  designHintLabelKey: null,
  isUiHidden: false,
  isUiMinimized: false,
  lastFrameTool: ToolName.frame,
  lastMoreTool: null,
  lastMouseTool: ToolName.default,
  lastPenTool: ToolName.pen,
  lastShapeTool: ToolName.rectangle,
  lastTextTool: ToolName.text,
  pages: {
    'page-1': {
      comments: {},
      guides: [],
      id: 'page-1',
      name: 'Page 1',
      nodes,
      paint: { color: '#d9d9d9', opacity: 100, type: 'solid' },
      rootOrder: Object.keys(nodes),
      selectedIds: [],
      viewport: { x: 0, y: 0, zoom: 1 },
    },
  },
  penActiveVertexId: null,
  vectorEditingNodeIds: [],
});

describe('handleReplaceNode', () => {
  it('should fully overwrite an existing node, leaving no stale fields from the previous shape', () => {
    // mock
    const state = buildState({ [frameNode.id]: { ...frameNode } });

    // before
    handleReplaceNode(state, { id: frameNode.id, node: vectorNode });

    // result
    expect(getActivePage(state).nodes[frameNode.id]).toBe(vectorNode);
    expect(getActivePage(state).nodes[frameNode.id]).not.toHaveProperty('fill');
    expect(getActivePage(state).nodes[frameNode.id]).not.toHaveProperty('width');
  });

  it('should keep the node at its existing rootOrder position', () => {
    // mock
    const other: TFrameNode = { ...frameNode, id: 'other' };
    const state = buildState({ [frameNode.id]: { ...frameNode }, other });

    // before
    handleReplaceNode(state, { id: frameNode.id, node: vectorNode });

    // result
    expect(getActivePage(state).rootOrder).toEqual([frameNode.id, 'other']);
  });

  it('should do nothing when the node does not exist', () => {
    // mock
    const state = buildState({});

    // before
    handleReplaceNode(state, { id: 'missing', node: vectorNode });

    // result
    expect(getActivePage(state).nodes).toEqual({});
  });

  it("should cascade-delete a replaced group's old children so they don't linger as orphans", () => {
    // mock — a group with two children, replaced by an unrelated leaf node
    const childA: TFrameNode = { ...frameNode, id: 'child-a', parentId: 'group-1' };
    const childB: TFrameNode = { ...frameNode, id: 'child-b', parentId: 'group-1' };
    const group: TGroupNode = {
      childIds: ['child-a', 'child-b'],
      height: 10,
      id: 'group-1',
      name: 'Group',
      parentId: null,
      rotation: 0,
      type: NodeType.group,
      width: 10,
      x: 0,
      y: 0,
    };
    const state = buildState({ 'child-a': childA, 'child-b': childB, 'group-1': group });

    // before
    handleReplaceNode(state, { id: 'group-1', node: { ...frameNode, id: 'group-1' } });

    // result — the new node landed at the same id, and the old children are gone
    expect(getActivePage(state).nodes['group-1']).toEqual({ ...frameNode, id: 'group-1' });
    expect(getActivePage(state).nodes['child-a']).toBeUndefined();
    expect(getActivePage(state).nodes['child-b']).toBeUndefined();

    // result — deleting the group's very last child must not also auto-prune the (already-replaced)
    // group's own slot out of rootOrder: pruneParentGroup deletes a now-childless group, so cascading
    // the delete before installing the new node would silently orphan it (regression: XG-APP paste-to-replace)
    expect(getActivePage(state).rootOrder).toContain('group-1');
  });

  it('should not cascade-delete anything when the replaced node was not a group', () => {
    // mock
    const state = buildState({ [frameNode.id]: { ...frameNode } });

    // before
    handleReplaceNode(state, { id: frameNode.id, node: vectorNode });

    // result
    expect(Object.keys(getActivePage(state).nodes)).toEqual([frameNode.id]);
  });
});
