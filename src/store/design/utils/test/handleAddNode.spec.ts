// types
import { NodeType, ToolName } from 'types/design/enums';
import { TDesignState } from '../../types';
import { TSceneNode } from 'types/design/types';

// utils
import { handleAddNode } from '../handleAddNode';

const node: TSceneNode = {
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

describe('handleAddNode', () => {
  it('should store the node and append its id to rootOrder', () => {
    // mock
    const state: TDesignState = {
      activeTool: ToolName.default,
      commentDraftPosition: null,
      comments: {},
      editingNodeId: null,
      editingSelectionChangedAt: 0,
      editingSelectionEnd: 0,
      editingSelectionStart: 0,
      editingTextBox: null,
      editingTextContent: '',
      lastFrameTool: ToolName.frame,
      lastMouseTool: ToolName.default,
      lastShapeTool: ToolName.rectangle,
      lastTextTool: ToolName.text,
      nodes: {},
      rootOrder: [],
      selectedIds: [],
      viewport: { x: 0, y: 0, zoom: 1 },
    };

    // before
    handleAddNode(state, node);

    // result
    expect(state.nodes[node.id]).toEqual(node);
    expect(state.rootOrder).toEqual([node.id]);
  });

  it('should append after existing nodes without disturbing them', () => {
    // mock
    const state: TDesignState = {
      activeTool: ToolName.default,
      commentDraftPosition: null,
      comments: {},
      editingNodeId: null,
      editingSelectionChangedAt: 0,
      editingSelectionEnd: 0,
      editingSelectionStart: 0,
      editingTextBox: null,
      editingTextContent: '',
      lastFrameTool: ToolName.frame,
      lastMouseTool: ToolName.default,
      lastShapeTool: ToolName.rectangle,
      lastTextTool: ToolName.text,
      nodes: { existing: { ...node, id: 'existing' } },
      rootOrder: ['existing'],
      selectedIds: [],
      viewport: { x: 0, y: 0, zoom: 1 },
    };

    // before
    handleAddNode(state, node);

    // result
    expect(state.rootOrder).toEqual(['existing', node.id]);
  });
});
