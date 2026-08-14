// types
import { NodeType, ToolName } from 'types/design/enums';
import { TDesignState } from '../../types';
import { TFrameNode } from 'types/design/types';

// utils
import { handleUpdateNode } from '../handleUpdateNode';

const node: TFrameNode = {
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

describe('handleUpdateNode', () => {
  it('should patch an existing node', () => {
    // mock
    const state: TDesignState = {
      activeTool: ToolName.default,
      editingNodeId: null,
      editingSelectionChangedAt: 0,
      editingSelectionEnd: 0,
      editingSelectionStart: 0,
      editingTextBox: null,
      editingTextContent: '',
      lastMouseTool: ToolName.default,
      lastShapeTool: ToolName.rectangle,
      nodes: { [node.id]: { ...node } },
      rootOrder: [node.id],
      selectedIds: [],
      viewport: { x: 0, y: 0, zoom: 1 },
    };

    // before
    handleUpdateNode(state, { changes: { width: 300 }, id: node.id });

    // result
    expect((state.nodes[node.id] as TFrameNode).width).toBe(300);
  });

  it('should do nothing when the node does not exist', () => {
    // mock
    const state: TDesignState = {
      activeTool: ToolName.default,
      editingNodeId: null,
      editingSelectionChangedAt: 0,
      editingSelectionEnd: 0,
      editingSelectionStart: 0,
      editingTextBox: null,
      editingTextContent: '',
      lastMouseTool: ToolName.default,
      lastShapeTool: ToolName.rectangle,
      nodes: {},
      rootOrder: [],
      selectedIds: [],
      viewport: { x: 0, y: 0, zoom: 1 },
    };

    // before
    handleUpdateNode(state, { changes: { width: 300 }, id: 'missing' });

    // result
    expect(state.nodes).toEqual({});
  });
});
