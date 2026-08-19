// types
import { NodeType, ToolName } from 'types/design/enums';
import { TDesignSnapshot, TDesignState } from '../../types';
import { TFrameNode, TVectorNode } from 'types/design/types';

// utils
import { handleReplaceDesignSnapshot } from '../handleReplaceDesignSnapshot';

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

const buildVectorNode = (overrides: Partial<TVectorNode> = {}): TVectorNode => ({
  fillColor: '#ff0000',
  id: 'vector-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: {},
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: { 'vertex-1': { id: 'vertex-1', x: 0, y: 0 } },
  ...overrides,
});

const buildState = (overrides: Partial<TDesignState> = {}): TDesignState => ({
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
  lastPenTool: ToolName.pen,
  lastShapeTool: ToolName.rectangle,
  lastTextTool: ToolName.text,
  nodes: {},
  penActiveVertexId: null,
  rootOrder: [],
  selectedIds: [],
  vectorEditingNodeId: null,
  viewport: { x: 0, y: 0, zoom: 1 },
  ...overrides,
});

const buildSnapshot = (overrides: Partial<TDesignSnapshot> = {}): TDesignSnapshot => ({
  nodes: {},
  rootOrder: [],
  selectedIds: [],
  ...overrides,
});

describe('handleReplaceDesignSnapshot', () => {
  it('should restore nodes, rootOrder and selectedIds from the snapshot', () => {
    // mock
    const state = buildState();
    const snapshot = buildSnapshot({ nodes: { [frame.id]: frame }, rootOrder: [frame.id], selectedIds: [frame.id] });

    // before
    handleReplaceDesignSnapshot(state, snapshot);

    // result
    expect(state.nodes).toEqual({ [frame.id]: frame });
    expect(state.rootOrder).toEqual([frame.id]);
    expect(state.selectedIds).toEqual([frame.id]);
  });

  it('should keep vectorEditingNodeId and penActiveVertexId when the restored node still has the active vertex', () => {
    // mock
    const vector = buildVectorNode();
    const state = buildState({ penActiveVertexId: 'vertex-1', vectorEditingNodeId: vector.id });
    const snapshot = buildSnapshot({ nodes: { [vector.id]: vector } });

    // before
    handleReplaceDesignSnapshot(state, snapshot);

    // result
    expect(state.vectorEditingNodeId).toBe(vector.id);
    expect(state.penActiveVertexId).toBe('vertex-1');
  });

  it('should clear vectorEditingNodeId and penActiveVertexId when the restored snapshot no longer has that node', () => {
    // mock
    const vector = buildVectorNode();
    const state = buildState({ penActiveVertexId: 'vertex-1', vectorEditingNodeId: vector.id });
    const snapshot = buildSnapshot({ nodes: {} });

    // before
    handleReplaceDesignSnapshot(state, snapshot);

    // result
    expect(state.vectorEditingNodeId).toBeNull();
    expect(state.penActiveVertexId).toBeNull();
  });

  it('should clear penActiveVertexId when the restored node no longer has that vertex', () => {
    // mock
    const vector = buildVectorNode();
    const state = buildState({ penActiveVertexId: 'vertex-stale', vectorEditingNodeId: vector.id });
    const snapshot = buildSnapshot({ nodes: { [vector.id]: vector } });

    // before
    handleReplaceDesignSnapshot(state, snapshot);

    // result
    expect(state.vectorEditingNodeId).toBe(vector.id);
    expect(state.penActiveVertexId).toBeNull();
  });
});
