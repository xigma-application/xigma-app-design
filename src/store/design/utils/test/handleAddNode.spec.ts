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
      activePageId: 'page-1',
      activeTool: ToolName.default,
      commentDraftPosition: null,
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
      pages: {
        'page-1': {
          comments: {},
          id: 'page-1',
          name: 'Page 1',
          nodes: {},
          paintColor: '#d9d9d9',
          rootOrder: [],
          selectedIds: [],
          viewport: { x: 0, y: 0, zoom: 1 },
        },
      },
      penActiveVertexId: null,
      vectorEditingNodeIds: [],
    };

    // before
    handleAddNode(state, node);

    // result
    expect(state.pages[state.activePageId].nodes[node.id]).toEqual(node);
    expect(state.pages[state.activePageId].rootOrder).toEqual([node.id]);
  });

  it('should append after existing nodes without disturbing them', () => {
    // mock
    const state: TDesignState = {
      activePageId: 'page-1',
      activeTool: ToolName.default,
      commentDraftPosition: null,
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
      pages: {
        'page-1': {
          comments: {},
          id: 'page-1',
          name: 'Page 1',
          nodes: { existing: { ...node, id: 'existing' } },
          paintColor: '#d9d9d9',
          rootOrder: ['existing'],
          selectedIds: [],
          viewport: { x: 0, y: 0, zoom: 1 },
        },
      },
      penActiveVertexId: null,
      vectorEditingNodeIds: [],
    };

    // before
    handleAddNode(state, node);

    // result
    expect(state.pages[state.activePageId].rootOrder).toEqual(['existing', node.id]);
  });
});
