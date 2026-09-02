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
      isActionsPanelOpen: false,
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

  it('should auto-number a new frame off the existing frames on the page', () => {
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
      isActionsPanelOpen: false,
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
          nodes: { 'frame-1': { ...node, id: 'frame-1', name: 'Frame 1' } },
          paintColor: '#d9d9d9',
          rootOrder: ['frame-1'],
          selectedIds: [],
          viewport: { x: 0, y: 0, zoom: 1 },
        },
      },
      penActiveVertexId: null,
      vectorEditingNodeIds: [],
    };

    // before
    handleAddNode(state, { ...node, name: 'Frame' });

    // result
    expect(state.pages['page-1'].nodes[node.id].name).toBe('Frame 2');
  });

  it('should auto-number a new section off the existing sections on the page', () => {
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
      isActionsPanelOpen: false,
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
          nodes: { 'section-1': { ...node, id: 'section-1', name: 'Section 1', type: NodeType.section } },
          paintColor: '#d9d9d9',
          rootOrder: ['section-1'],
          selectedIds: [],
          viewport: { x: 0, y: 0, zoom: 1 },
        },
      },
      penActiveVertexId: null,
      vectorEditingNodeIds: [],
    };

    // before
    handleAddNode(state, { ...node, name: 'Section', type: NodeType.section });

    // result
    expect(state.pages['page-1'].nodes[node.id].name).toBe('Section 2');
  });

  it('should leave a non-frame node name untouched', () => {
    // mock
    const rectangle: TSceneNode = { ...node, id: 'rect-1', name: 'Rectangle', type: NodeType.rectangle };
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
      isActionsPanelOpen: false,
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
    handleAddNode(state, rectangle);

    // result
    expect(state.pages['page-1'].nodes['rect-1'].name).toBe('Rectangle');
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
      isActionsPanelOpen: false,
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
