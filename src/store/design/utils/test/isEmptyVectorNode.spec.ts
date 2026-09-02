// types
import { NodeType, ToolName } from 'types/design/enums';
import { TDesignPage, TDesignState } from '../../types';
import { TFrameNode, TVectorNode } from 'types/design/types';

// utils
import { isEmptyVectorNode } from '../isEmptyVectorNode';

const buildState = (nodes: TDesignPage['nodes']): TDesignState => ({
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
      id: 'page-1',
      name: 'Page 1',
      nodes,
      paintColor: '#d9d9d9',
      rootOrder: Object.keys(nodes),
      selectedIds: [],
      viewport: { x: 0, y: 0, zoom: 1 },
    },
  },
  penActiveVertexId: null,
  vectorEditingNodeIds: [],
});

const buildVectorNode = (overrides: Partial<TVectorNode> = {}): TVectorNode => ({
  fillColor: null,
  filledFaceKeys: [],
  id: 'vector-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: {},
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: { v1: { id: 'v1', x: 0, y: 0 } },
  ...overrides,
});

describe('isEmptyVectorNode', () => {
  it('should return true for a vector node with no segments', () => {
    // mock
    const node = buildVectorNode();
    const state = buildState({ [node.id]: node });

    // result
    expect(isEmptyVectorNode(state, node.id)).toBe(true);
  });

  it('should return false for a vector node that has at least one segment', () => {
    // mock
    const node = buildVectorNode({
      segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
    });
    const state = buildState({ [node.id]: node });

    // result
    expect(isEmptyVectorNode(state, node.id)).toBe(false);
  });

  it('should return false for a non-vector node', () => {
    // mock
    const frame: TFrameNode = {
      fill: '#ff0000',
      height: 10,
      id: 'frame-1',
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 10,
      x: 0,
      y: 0,
    };
    const state = buildState({ [frame.id]: frame });

    // result
    expect(isEmptyVectorNode(state, frame.id)).toBe(false);
  });

  it('should return false when the id does not resolve to any node', () => {
    // mock
    const state = buildState({});

    // result
    expect(isEmptyVectorNode(state, 'missing')).toBe(false);
  });
});
