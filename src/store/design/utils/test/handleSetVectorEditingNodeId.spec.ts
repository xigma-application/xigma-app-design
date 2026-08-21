// types
import { NodeType, ToolName } from 'types/design/enums';
import { TDesignState } from '../../types';
import { TVectorNode } from 'types/design/types';

// utils
import { handleSetVectorEditingNodeId } from '../handleSetVectorEditingNodeId';

const buildState = (nodes: TDesignState['nodes'], overrides: Partial<TDesignState> = {}): TDesignState => ({
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
  nodes,
  penActiveVertexId: null,
  rootOrder: Object.keys(nodes),
  selectedIds: [],
  vectorEditingNodeId: null,
  viewport: { x: 0, y: 0, zoom: 1 },
  ...overrides,
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

describe('handleSetVectorEditingNodeId', () => {
  it('should set the new editing node id with nothing to clean up when there was no previous one', () => {
    // mock
    const node = buildVectorNode();
    const state = buildState({ [node.id]: node });

    // before
    handleSetVectorEditingNodeId(state, node.id);

    // result
    expect(state.vectorEditingNodeId).toBe(node.id);
    expect(state.nodes[node.id]).toBeDefined();
  });

  it('should delete the exited node when it never got any segments drawn', () => {
    // mock — the abandoned-first-click case: one vertex, no segments
    const node = buildVectorNode();
    const state = buildState({ [node.id]: node }, { vectorEditingNodeId: node.id });

    // before
    handleSetVectorEditingNodeId(state, null);

    // result
    expect(state.vectorEditingNodeId).toBeNull();
    expect(state.nodes[node.id]).toBeUndefined();
  });

  it('should not delete the exited node when it already has a segment', () => {
    // mock
    const node = buildVectorNode({
      segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } },
    });
    const state = buildState({ [node.id]: node }, { vectorEditingNodeId: node.id });

    // before
    handleSetVectorEditingNodeId(state, null);

    // result
    expect(state.vectorEditingNodeId).toBeNull();
    expect(state.nodes[node.id]).toBeDefined();
  });

  it('should not delete anything when re-entering edit mode on the same still-empty node', () => {
    // mock — e.g. re-arming a drag on the same node; the id does not actually change
    const node = buildVectorNode();
    const state = buildState({ [node.id]: node }, { vectorEditingNodeId: node.id });

    // before
    handleSetVectorEditingNodeId(state, node.id);

    // result
    expect(state.nodes[node.id]).toBeDefined();
  });
});
