// types
import { NodeType, PathType, ToolName } from 'types/design/enums';
import { TDesignState } from '../../../types';
import { TPathNode, TRectangleNode, TTextNode, TVectorNode, TVectorSegment } from 'types/design/types';

// utils
import { getActivePage } from '../../getActivePage';
import { syncBoundNode } from '../syncBoundNode';

const buildState = (nodes: Record<string, TPathNode | TRectangleNode | TTextNode | TVectorNode>): TDesignState => ({
  activePageId: 'page-1',
  activeTool: ToolName.default,
  preferences: {
    areAdditionalLabelsVisible: true,
    areFrameOutlinesVisible: false,
    areMaskOutlinesVisible: false,
    areRulersVisible: false,
  },
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

const buildPathText = (overrides: Partial<TTextNode> = {}): TTextNode => ({
  content: 'Hi',
  fill: '#ffffff',
  flipX: false,
  flipY: false,
  fontFamily: 'Inter',
  fontSize: 14,
  height: 200,
  id: 'text-1',
  name: 'Text',
  parentId: null,
  pathId: null,
  pathStartOffset: 0,
  rotation: 0,
  type: NodeType.text,
  width: 200,
  x: 0,
  y: 0,
  ...overrides,
});

describe('syncBoundNode', () => {
  it('should sync path-bound text nodes for a path node', () => {
    // mock
    const pathNode: TPathNode = {
      height: 300,
      id: 'path-1',
      name: 'Path',
      parentId: null,
      pathType: PathType.ellipse,
      rotation: 0,
      type: NodeType.path,
      width: 300,
      x: 0,
      y: 0,
    };
    const textNode = buildPathText({ pathId: 'path-1' });
    const state = buildState({ 'path-1': pathNode, 'text-1': textNode });

    // action
    syncBoundNode(state, pathNode);

    // result
    expect(getActivePage(state).nodes['text-1']).toMatchObject({ height: 300, width: 300 });
  });

  it('should sync the source path when a bound text node is updated', () => {
    // mock
    const pathNode: TPathNode = {
      height: 200,
      id: 'path-1',
      name: 'Path',
      parentId: null,
      pathType: PathType.ellipse,
      rotation: 0,
      type: NodeType.path,
      width: 200,
      x: 0,
      y: 0,
    };
    const textNode = buildPathText({ height: 400, pathId: 'path-1', width: 400 });
    const state = buildState({ 'path-1': pathNode, 'text-1': textNode });

    // action
    syncBoundNode(state, textNode);

    // result
    expect(getActivePage(state).nodes['path-1']).toMatchObject({ height: 400, width: 400 });
  });

  it('should leave a text node without a bound path untouched', () => {
    // mock
    const textNode = buildPathText({ pathId: null });
    const state = buildState({ 'text-1': textNode });

    // action / result
    expect(() => syncBoundNode(state, textNode)).not.toThrow();
  });

  it('should sync path-bound text nodes for a vector node', () => {
    // mock
    const seg: TVectorSegment = { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null };
    const vectorNode: TVectorNode = {
      defaultFill: [],
      filledFaceKeys: [],
      id: 'vector-1',
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: { s1: seg },
      strokeColor: '#000',
      strokeWidth: 4,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    };
    const textNode = buildPathText({ pathId: 'vector-1' });
    const state = buildState({ 'text-1': textNode, 'vector-1': vectorNode });

    // action
    syncBoundNode(state, vectorNode);

    // result
    expect(getActivePage(state).nodes['text-1']).toMatchObject({ height: 0, width: 100 });
  });

  it('should do nothing for a node type that binds nothing, such as a rectangle', () => {
    // mock
    const rect: TRectangleNode = {
      fill: '#fff',
      height: 10,
      id: 'rect-1',
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: 10,
      x: 0,
      y: 0,
    };
    const state = buildState({ 'rect-1': rect });

    // action / result
    expect(() => syncBoundNode(state, rect)).not.toThrow();
  });
});
