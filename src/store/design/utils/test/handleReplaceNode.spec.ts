// types
import { NodeType, ToolName } from 'types/design/enums';
import { TDesignState } from '../../types';
import { TFrameNode, TVectorNode } from 'types/design/types';

// utils
import { handleReplaceNode } from '../handleReplaceNode';

const frameNode: TFrameNode = {
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
  fillColor: '#ff0000',
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

const buildState = (nodes: TDesignState['nodes']): TDesignState => ({
  activeTool: ToolName.default,
  commentDraftPosition: null,
  comments: {},
  editingNodeId: null,
  editingSelectionChangedAt: 0,
  editingSelectionEnd: 0,
  editingSelectionStart: 0,
  editingTextBox: null,
  editingTextContent: '',
  isUiMinimized: false,
  lastFrameTool: ToolName.frame,
  lastMoreTool: null,
  lastMouseTool: ToolName.default,
  lastPenTool: ToolName.pen,
  lastShapeTool: ToolName.rectangle,
  lastTextTool: ToolName.text,
  nodes,
  paintColor: '#d9d9d9',
  penActiveVertexId: null,
  rootOrder: Object.keys(nodes),
  selectedIds: [],
  vectorEditingNodeIds: [],
  viewport: { x: 0, y: 0, zoom: 1 },
});

describe('handleReplaceNode', () => {
  it('should fully overwrite an existing node, leaving no stale fields from the previous shape', () => {
    // mock
    const state = buildState({ [frameNode.id]: { ...frameNode } });

    // before
    handleReplaceNode(state, { id: frameNode.id, node: vectorNode });

    // result
    expect(state.nodes[frameNode.id]).toBe(vectorNode);
    expect(state.nodes[frameNode.id]).not.toHaveProperty('fill');
    expect(state.nodes[frameNode.id]).not.toHaveProperty('width');
  });

  it('should keep the node at its existing rootOrder position', () => {
    // mock
    const other: TFrameNode = { ...frameNode, id: 'other' };
    const state = buildState({ [frameNode.id]: { ...frameNode }, other });

    // before
    handleReplaceNode(state, { id: frameNode.id, node: vectorNode });

    // result
    expect(state.rootOrder).toEqual([frameNode.id, 'other']);
  });

  it('should do nothing when the node does not exist', () => {
    // mock
    const state = buildState({});

    // before
    handleReplaceNode(state, { id: 'missing', node: vectorNode });

    // result
    expect(state.nodes).toEqual({});
  });
});
