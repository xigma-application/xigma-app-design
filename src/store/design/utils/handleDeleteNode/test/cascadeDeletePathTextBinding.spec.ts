// types
import { NodeType, PathType, ToolName } from 'types/design/enums';
import { TDesignPage, TDesignState } from '../../../types';
import { TPathNode, TRectangleNode, TTextNode } from 'types/design/types';

// utils
import { cascadeDeletePathTextBinding } from '../cascadeDeletePathTextBinding';
import { getActivePage } from '../../getActivePage';

const rect = (id: string): TRectangleNode => ({
  fill: '#fff',
  height: 10,
  id,
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 10,
  x: 0,
  y: 0,
});

const pathNode = (id: string): TPathNode => ({
  height: 100,
  id,
  name: 'Path',
  parentId: null,
  pathType: PathType.ellipse,
  rotation: 0,
  type: NodeType.path,
  width: 100,
  x: 0,
  y: 0,
});

const textNode = (id: string, pathId: string | null): TTextNode => ({
  content: 'Hi',
  fill: '#fff',
  flipX: false,
  flipY: false,
  fontFamily: 'Inter',
  fontSize: 14,
  height: 20,
  id,
  name: 'Text',
  parentId: null,
  pathId,
  rotation: 0,
  type: NodeType.text,
  width: 100,
  x: 0,
  y: 0,
});

const buildState = (page: Partial<TDesignPage>): TDesignState => ({
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
  isActionsPanelOpen: false,
  isMediaToolArmed: false,
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
      ...page,
    },
  },
  penActiveVertexId: null,
  preferences: {
    areAdditionalLabelsVisible: true,
    areFrameOutlinesVisible: false,
    areMaskOutlinesVisible: false,
    areRulersVisible: false,
  },
  vectorEditingNodeIds: [],
});

describe('cascadeDeletePathTextBinding', () => {
  it('should delete the bound path node for a text-on-path node', () => {
    // mock
    const text = textNode('text-1', 'path-1');
    const state = buildState({ nodes: { 'path-1': pathNode('path-1'), 'text-1': text } });

    // action
    cascadeDeletePathTextBinding(state, text);

    // result
    expect(getActivePage(state).nodes['path-1']).toBeUndefined();
  });

  it('should delete every text node bound to a deleted path node', () => {
    // mock
    const path = pathNode('path-1');
    const state = buildState({
      nodes: { 'path-1': path, 'text-1': textNode('text-1', 'path-1'), 'text-2': textNode('text-2', 'path-1') },
    });

    // action
    cascadeDeletePathTextBinding(state, path);

    // result
    const page = getActivePage(state);
    expect(page.nodes['text-1']).toBeUndefined();
    expect(page.nodes['text-2']).toBeUndefined();
  });

  it('should do nothing for a node with no path binding', () => {
    // mock
    const node = rect('a');
    const state = buildState({ nodes: { a: node, b: rect('b') } });

    // action
    cascadeDeletePathTextBinding(state, node);

    // result
    expect(getActivePage(state).nodes.b).toBeDefined();
  });
});
