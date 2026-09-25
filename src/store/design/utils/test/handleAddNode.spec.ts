import { omit } from 'lodash';

// types
import { LayoutMode, NodeType, SizingMode, ToolName } from 'types/design/enums';
import { TDesignPage, TDesignState } from '../../types';
import { TSceneNode } from 'types/design/types';

// utils
import { handleAddNode } from '../handleAddNode';

const buildState = (page: TDesignPage): TDesignState =>
  ({
    activePageId: page.id,
    activeTool: ToolName.default,
    lastFrameTool: ToolName.frame,
    lastMouseTool: ToolName.default,
    lastPenTool: ToolName.pen,
    lastShapeTool: ToolName.rectangle,
    lastTextTool: ToolName.text,
    pages: { [page.id]: page },
    preferences: {
      areAdditionalLabelsVisible: true,
      areFrameOutlinesVisible: false,
      areLayoutGuidesVisible: true,
      areMaskOutlinesVisible: false,
      areRulersVisible: false,
      resolvedTheme: 'dark',
    },
    revealedMinMax: { maxHeight: false, maxWidth: false, minHeight: false, minWidth: false },
    vectorEditingNodeIds: [],
  }) as unknown as TDesignState;

const node: TSceneNode = {
  childIds: [],
  clipContent: true,
  fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
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

const sectionNode: TSceneNode = {
  ...omit(node, 'fills'),
  fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
  type: NodeType.section,
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
      commentDraftPosition: null,
      designHintLabelKey: null,
      editingNodeId: null,
      editingSelectionChangedAt: 0,
      editingSelectionEnd: 0,
      editingSelectionStart: 0,
      editingTextBox: null,
      editingTextContent: '',
      gradientEditor: null,
      imageEditor: null,
      isActionsPanelOpen: false,
      isMediaToolArmed: false,
      isPatternSourcePicking: false,
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
      patternSourcePickTarget: null,
      penActiveVertexId: null,
      preferences: {
        areAdditionalLabelsVisible: true,
        areFrameOutlinesVisible: false,
        areLayoutGuidesVisible: true,
        areMaskOutlinesVisible: false,
        areRulersVisible: false,
        resolvedTheme: 'dark',
      },
      revealedMinMax: { maxHeight: false, maxWidth: false, minHeight: false, minWidth: false },
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
      commentDraftPosition: null,
      designHintLabelKey: null,
      editingNodeId: null,
      editingSelectionChangedAt: 0,
      editingSelectionEnd: 0,
      editingSelectionStart: 0,
      editingTextBox: null,
      editingTextContent: '',
      gradientEditor: null,
      imageEditor: null,
      isActionsPanelOpen: false,
      isMediaToolArmed: false,
      isPatternSourcePicking: false,
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
      patternSourcePickTarget: null,
      penActiveVertexId: null,
      preferences: {
        areAdditionalLabelsVisible: true,
        areFrameOutlinesVisible: false,
        areLayoutGuidesVisible: true,
        areMaskOutlinesVisible: false,
        areRulersVisible: false,
        resolvedTheme: 'dark',
      },
      revealedMinMax: { maxHeight: false, maxWidth: false, minHeight: false, minWidth: false },
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
      commentDraftPosition: null,
      designHintLabelKey: null,
      editingNodeId: null,
      editingSelectionChangedAt: 0,
      editingSelectionEnd: 0,
      editingSelectionStart: 0,
      editingTextBox: null,
      editingTextContent: '',
      gradientEditor: null,
      imageEditor: null,
      isActionsPanelOpen: false,
      isMediaToolArmed: false,
      isPatternSourcePicking: false,
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
          nodes: { 'section-1': { ...sectionNode, id: 'section-1', name: 'Section (1)' } },
          paint: { color: '#d9d9d9', opacity: 100, type: 'solid' },
          rootOrder: ['section-1'],
          selectedIds: [],
          viewport: { x: 0, y: 0, zoom: 1 },
        },
      },
      patternSourcePickTarget: null,
      penActiveVertexId: null,
      preferences: {
        areAdditionalLabelsVisible: true,
        areFrameOutlinesVisible: false,
        areLayoutGuidesVisible: true,
        areMaskOutlinesVisible: false,
        areRulersVisible: false,
        resolvedTheme: 'dark',
      },
      revealedMinMax: { maxHeight: false, maxWidth: false, minHeight: false, minWidth: false },
      vectorEditingNodeIds: [],
    };

    // before
    handleAddNode(state, { ...sectionNode, name: 'Section' });

    // result
    expect(state.pages['page-1'].nodes[node.id].name).toBe('Section (2)');
  });

  it('should auto-number a new rectangle the same way frames and sections are, off the base name it was drawn with', () => {
    // mock
    const rectangle: TSceneNode = { ...node, id: 'rect-1', name: 'Rectangle', type: NodeType.rectangle };
    const state: TDesignState = {
      activePageId: 'page-1',
      activeTool: ToolName.default,
      commentDraftPosition: null,
      designHintLabelKey: null,
      editingNodeId: null,
      editingSelectionChangedAt: 0,
      editingSelectionEnd: 0,
      editingSelectionStart: 0,
      editingTextBox: null,
      editingTextContent: '',
      gradientEditor: null,
      imageEditor: null,
      isActionsPanelOpen: false,
      isMediaToolArmed: false,
      isPatternSourcePicking: false,
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
      patternSourcePickTarget: null,
      penActiveVertexId: null,
      preferences: {
        areAdditionalLabelsVisible: true,
        areFrameOutlinesVisible: false,
        areLayoutGuidesVisible: true,
        areMaskOutlinesVisible: false,
        areRulersVisible: false,
        resolvedTheme: 'dark',
      },
      revealedMinMax: { maxHeight: false, maxWidth: false, minHeight: false, minWidth: false },
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
      commentDraftPosition: null,
      designHintLabelKey: null,
      editingNodeId: null,
      editingSelectionChangedAt: 0,
      editingSelectionEnd: 0,
      editingSelectionStart: 0,
      editingTextBox: null,
      editingTextContent: '',
      gradientEditor: null,
      imageEditor: null,
      isActionsPanelOpen: false,
      isMediaToolArmed: false,
      isPatternSourcePicking: false,
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
      patternSourcePickTarget: null,
      penActiveVertexId: null,
      preferences: {
        areAdditionalLabelsVisible: true,
        areFrameOutlinesVisible: false,
        areLayoutGuidesVisible: true,
        areMaskOutlinesVisible: false,
        areRulersVisible: false,
        resolvedTheme: 'dark',
      },
      revealedMinMax: { maxHeight: false, maxWidth: false, minHeight: false, minWidth: false },
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
      commentDraftPosition: null,
      designHintLabelKey: null,
      editingNodeId: null,
      editingSelectionChangedAt: 0,
      editingSelectionEnd: 0,
      editingSelectionStart: 0,
      editingTextBox: null,
      editingTextContent: '',
      gradientEditor: null,
      imageEditor: null,
      isActionsPanelOpen: false,
      isMediaToolArmed: false,
      isPatternSourcePicking: false,
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
      patternSourcePickTarget: null,
      penActiveVertexId: null,
      preferences: {
        areAdditionalLabelsVisible: true,
        areFrameOutlinesVisible: false,
        areLayoutGuidesVisible: true,
        areMaskOutlinesVisible: false,
        areRulersVisible: false,
        resolvedTheme: 'dark',
      },
      revealedMinMax: { maxHeight: false, maxWidth: false, minHeight: false, minWidth: false },
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
      commentDraftPosition: null,
      designHintLabelKey: null,
      editingNodeId: null,
      editingSelectionChangedAt: 0,
      editingSelectionEnd: 0,
      editingSelectionStart: 0,
      editingTextBox: null,
      editingTextContent: '',
      gradientEditor: null,
      imageEditor: null,
      isActionsPanelOpen: false,
      isMediaToolArmed: false,
      isPatternSourcePicking: false,
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
      patternSourcePickTarget: null,
      penActiveVertexId: null,
      preferences: {
        areAdditionalLabelsVisible: true,
        areFrameOutlinesVisible: false,
        areLayoutGuidesVisible: true,
        areMaskOutlinesVisible: false,
        areRulersVisible: false,
        resolvedTheme: 'dark',
      },
      revealedMinMax: { maxHeight: false, maxWidth: false, minHeight: false, minWidth: false },
      vectorEditingNodeIds: [],
    };

    // before
    handleAddNode(state, node);

    // result
    expect(state.pages[state.activePageId].rootOrder).toEqual(['existing', node.id]);
  });

  it('should insert a new node into a freeform frame at the given target index instead of the page root', () => {
    // mock
    const frame = { ...node, childIds: ['existing-child'], id: 'frame-1', name: 'Frame' };
    const child = { ...node, id: 'existing-child', name: 'Existing', parentId: 'frame-1' };
    const state = buildState({
      backgroundPaint: { color: '#d9d9d9', opacity: 100, type: 'solid' },
      comments: {},
      guides: [],
      id: 'page-1',
      name: 'Page 1',
      nodes: { 'existing-child': child, 'frame-1': frame },
      paint: { color: '#d9d9d9', opacity: 100, type: 'solid' },
      rootOrder: ['frame-1'],
      selectedIds: [],
      viewport: { x: 0, y: 0, zoom: 1 },
    } as unknown as TDesignPage);
    const newNode: TSceneNode = { ...node, id: 'new-child', name: 'New', parentId: 'frame-1' };

    // before
    handleAddNode(state, newNode);

    // result
    const page = state.pages['page-1'];

    expect(page.rootOrder).toEqual(['frame-1']);
    expect((page.nodes['frame-1'] as { childIds: string[] }).childIds).toEqual(['existing-child', 'new-child']);
  });

  it('should reflow siblings when a new node is added into a horizontal auto-layout frame', () => {
    // mock
    const frame = {
      childIds: ['left'],
      clipContent: true,
      fills: [],
      height: 100,
      horizontalGap: 0,
      id: 'frame-1',
      layoutMode: LayoutMode.horizontal,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 300,
      x: 0,
      y: 0,
    };
    const left = { ...node, height: 50, id: 'left', name: 'Left', parentId: 'frame-1', width: 50, x: 0, y: 0 };
    const state = buildState({
      backgroundPaint: { color: '#d9d9d9', opacity: 100, type: 'solid' },
      comments: {},
      guides: [],
      id: 'page-1',
      name: 'Page 1',
      nodes: { 'frame-1': frame, left },
      paint: { color: '#d9d9d9', opacity: 100, type: 'solid' },
      rootOrder: ['frame-1'],
      selectedIds: [],
      viewport: { x: 0, y: 0, zoom: 1 },
    } as unknown as TDesignPage);
    const newNode: TSceneNode = { ...node, height: 50, id: 'right', name: 'Right', parentId: 'frame-1', width: 50, x: 200, y: 0 };

    // before — inserted after the existing child, at index 1
    handleAddNode(state, { ...newNode, targetIndex: 1 });

    // result — auto-layout sync must have repositioned the new child right after "left", touching it
    const page = state.pages['page-1'];

    expect((page.nodes['frame-1'] as { childIds: string[] }).childIds).toEqual(['left', 'right']);
    expect((page.nodes.right as { x: number }).x).toBe(50);
  });

  it('should anchor a new node into an explicit grid cell and switch the frame off auto-placement', () => {
    // mock
    const frame = {
      childIds: ['occupant'],
      clipContent: true,
      fills: [],
      gridAutoPlacement: true,
      gridColumnCount: 2,
      height: 200,
      id: 'frame-1',
      layoutMode: LayoutMode.grid,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 200,
      x: 0,
      y: 0,
    };
    const occupant = {
      ...node,
      gridColumnAnchorIndex: 0,
      gridRowAnchorIndex: 0,
      height: 100,
      id: 'occupant',
      name: 'Occupant',
      parentId: 'frame-1',
      width: 100,
    };
    const state = buildState({
      backgroundPaint: { color: '#d9d9d9', opacity: 100, type: 'solid' },
      comments: {},
      guides: [],
      id: 'page-1',
      name: 'Page 1',
      nodes: { 'frame-1': frame, occupant },
      paint: { color: '#d9d9d9', opacity: 100, type: 'solid' },
      rootOrder: ['frame-1'],
      selectedIds: [],
      viewport: { x: 0, y: 0, zoom: 1 },
    } as unknown as TDesignPage);
    const newNode: TSceneNode = { ...node, height: 100, id: 'new-cell', name: 'New', parentId: 'frame-1', width: 100 };

    // before — inserted at index 0, pushing the occupant to the next cell
    handleAddNode(state, { ...newNode, targetIndex: 0 });

    // result
    const page = state.pages['page-1'];
    const newCell = page.nodes['new-cell'] as unknown as {
      gridColumnAnchorIndex: number;
      gridRowAnchorIndex: number;
      widthSizingMode: SizingMode;
    };
    const shiftedOccupant = page.nodes.occupant as unknown as { gridColumnAnchorIndex: number; gridRowAnchorIndex: number };

    expect((page.nodes['frame-1'] as { gridAutoPlacement: boolean }).gridAutoPlacement).toBe(false);
    expect(newCell.gridColumnAnchorIndex).toBe(0);
    expect(newCell.gridRowAnchorIndex).toBe(0);
    expect(newCell.widthSizingMode).toBe(SizingMode.fill);
    expect(shiftedOccupant.gridColumnAnchorIndex).toBe(1);
    expect(shiftedOccupant.gridRowAnchorIndex).toBe(0);
  });
});
