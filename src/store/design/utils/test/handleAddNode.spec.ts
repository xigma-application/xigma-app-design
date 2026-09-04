// types
import { NodeType, ToolName } from 'types/design/enums';
import { TDesignState } from '../../types';
import { TSceneNode } from 'types/design/types';

// utils
import { handleAddNode } from '../handleAddNode';

const node: TSceneNode = {
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

const lineNode: TSceneNode = {
  id: 'line-1',
  name: 'Line (1)',
  parentId: null,
  stroke: '#000000',
  type: NodeType.line,
  x1: 0,
  x2: 10,
  y1: 0,
  y2: 0,
};

describe('handleAddNode', () => {
  it('should store the node and append its id to rootOrder', () => {
    // mock
    const state: TDesignState = {
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
          backgroundPaint: { color: '#d9d9d9', opacity: 100, type: 'solid' },
          comments: {},
          guides: [],
          id: 'page-1',
          name: 'Page 1',
          nodes: {},
          paint: { color: '#d9d9d9', opacity: 100, type: 'solid' },
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
    expect(state.pages[state.activePageId].nodes[node.id]).toEqual({ ...node, name: 'Frame (1)' });
    expect(state.pages[state.activePageId].rootOrder).toEqual([node.id]);
  });

  it('should auto-number a new frame off the existing frames on the page', () => {
    // mock
    const state: TDesignState = {
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
          backgroundPaint: { color: '#d9d9d9', opacity: 100, type: 'solid' },
          comments: {},
          guides: [],
          id: 'page-1',
          name: 'Page 1',
          nodes: { 'frame-1': { ...node, id: 'frame-1', name: 'Frame (1)' } },
          paint: { color: '#d9d9d9', opacity: 100, type: 'solid' },
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
    expect(state.pages['page-1'].nodes[node.id].name).toBe('Frame (2)');
  });

  it('should auto-number a new section off the existing sections on the page', () => {
    // mock
    const state: TDesignState = {
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
          backgroundPaint: { color: '#d9d9d9', opacity: 100, type: 'solid' },
          comments: {},
          guides: [],
          id: 'page-1',
          name: 'Page 1',
          nodes: { 'section-1': { ...node, id: 'section-1', name: 'Section (1)', type: NodeType.section } },
          paint: { color: '#d9d9d9', opacity: 100, type: 'solid' },
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
    expect(state.pages['page-1'].nodes[node.id].name).toBe('Section (2)');
  });

  it('should auto-number a new rectangle the same way frames and sections are, off the base name it was drawn with', () => {
    // mock
    const rectangle: TSceneNode = { ...node, id: 'rect-1', name: 'Rectangle', type: NodeType.rectangle };
    const state: TDesignState = {
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
          backgroundPaint: { color: '#d9d9d9', opacity: 100, type: 'solid' },
          comments: {},
          guides: [],
          id: 'page-1',
          name: 'Page 1',
          nodes: {},
          paint: { color: '#d9d9d9', opacity: 100, type: 'solid' },
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
    expect(state.pages['page-1'].nodes['rect-1'].name).toBe('Rectangle (1)');
  });

  it('should number a same-named node type independently of nodes with an unrelated base name', () => {
    // mock
    const state: TDesignState = {
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
          backgroundPaint: { color: '#d9d9d9', opacity: 100, type: 'solid' },
          comments: {},
          guides: [],
          id: 'page-1',
          name: 'Page 1',
          nodes: {
            'line-1': lineNode,
            'rect-1': { ...node, id: 'rect-1', name: 'Rectangle (1)', type: NodeType.rectangle },
          },
          paint: { color: '#d9d9d9', opacity: 100, type: 'solid' },
          rootOrder: ['rect-1', 'line-1'],
          selectedIds: [],
          viewport: { x: 0, y: 0, zoom: 1 },
        },
      },
      penActiveVertexId: null,
      vectorEditingNodeIds: [],
    };

    // before — an arrow is also type "line" but drawn with a different base name, so it starts its own count
    handleAddNode(state, { ...lineNode, id: 'arrow-1', name: 'Arrow' });

    // result
    expect(state.pages['page-1'].nodes['arrow-1'].name).toBe('Arrow (1)');
  });

  it('should leave a media node named after its uploaded filename untouched', () => {
    // mock
    const state: TDesignState = {
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
          backgroundPaint: { color: '#d9d9d9', opacity: 100, type: 'solid' },
          comments: {},
          guides: [],
          id: 'page-1',
          name: 'Page 1',
          nodes: {},
          paint: { color: '#d9d9d9', opacity: 100, type: 'solid' },
          rootOrder: [],
          selectedIds: [],
          viewport: { x: 0, y: 0, zoom: 1 },
        },
      },
      penActiveVertexId: null,
      vectorEditingNodeIds: [],
    };
    const media = {
      flipX: false,
      flipY: false,
      height: 10,
      id: 'media-1',
      name: 'photo.png',
      parentId: null,
      rotation: 0,
      src: 'blob:photo',
      type: NodeType.media,
      width: 10,
      x: 0,
      y: 0,
    } as unknown as TSceneNode;

    // before
    handleAddNode(state, media);

    // result
    expect(state.pages['page-1'].nodes['media-1'].name).toBe('photo.png');
  });

  it('should append after existing nodes without disturbing them', () => {
    // mock
    const state: TDesignState = {
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
          backgroundPaint: { color: '#d9d9d9', opacity: 100, type: 'solid' },
          comments: {},
          guides: [],
          id: 'page-1',
          name: 'Page 1',
          nodes: { existing: { ...node, id: 'existing' } },
          paint: { color: '#d9d9d9', opacity: 100, type: 'solid' },
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
