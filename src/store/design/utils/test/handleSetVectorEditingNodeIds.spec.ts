// types
import { NodeType, ToolName } from 'types/design/enums';
import { TDesignState } from '../../types';
import { TVectorNode } from 'types/design/types';

// utils
import { handleSetVectorEditingNodeIds } from '../handleSetVectorEditingNodeIds';

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
  lastMoreTool: null,
  lastMouseTool: ToolName.default,
  lastPenTool: ToolName.pen,
  lastShapeTool: ToolName.rectangle,
  lastTextTool: ToolName.text,
  nodes,
  paintColor: '#d9d9d9',
  penActiveVertexId: null,
  rootOrder: Object.keys(nodes),
  selectedIds: [],
  vectorEditingNodeIds: [],
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

describe('handleSetVectorEditingNodeIds', () => {
  it('should set the new editing node ids with nothing to clean up when there was no previous one', () => {
    // mock
    const node = buildVectorNode();
    const state = buildState({ [node.id]: node });

    // before
    handleSetVectorEditingNodeIds(state, [node.id]);

    // result
    expect(state.vectorEditingNodeIds).toEqual([node.id]);
    expect(state.nodes[node.id]).toBeDefined();
  });

  it('should reset the last More tool when exiting Vector Edit Mode entirely', () => {
    // mock
    const node = buildVectorNode();
    const state = buildState({ [node.id]: node }, { lastMoreTool: ToolName.shapeBuilder, vectorEditingNodeIds: [node.id] });

    // before
    handleSetVectorEditingNodeIds(state, []);

    // result
    expect(state.lastMoreTool).toBeNull();
  });

  it('should keep the last More tool while Vector Edit Mode is still active on another node', () => {
    // mock — switching which node is being edited, not exiting
    const nodeA = buildVectorNode({ id: 'vector-a' });
    const nodeB = buildVectorNode({ id: 'vector-b' });
    const state = buildState(
      { [nodeA.id]: nodeA, [nodeB.id]: nodeB },
      { lastMoreTool: ToolName.shapeBuilder, vectorEditingNodeIds: [nodeA.id] },
    );

    // before
    handleSetVectorEditingNodeIds(state, [nodeB.id]);

    // result
    expect(state.lastMoreTool).toBe(ToolName.shapeBuilder);
  });

  it('should delete the exited node when it never got any segments drawn', () => {
    // mock — the abandoned-first-click case: one vertex, no segments
    const node = buildVectorNode();
    const state = buildState({ [node.id]: node }, { vectorEditingNodeIds: [node.id] });

    // before
    handleSetVectorEditingNodeIds(state, []);

    // result
    expect(state.vectorEditingNodeIds).toEqual([]);
    expect(state.nodes[node.id]).toBeUndefined();
  });

  it('should not delete the exited node when it already has a segment', () => {
    // mock
    const node = buildVectorNode({
      segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } },
    });
    const state = buildState({ [node.id]: node }, { vectorEditingNodeIds: [node.id] });

    // before
    handleSetVectorEditingNodeIds(state, []);

    // result
    expect(state.vectorEditingNodeIds).toEqual([]);
    expect(state.nodes[node.id]).toBeDefined();
  });

  it('should not delete anything when re-entering edit mode on the same still-empty node', () => {
    // mock — e.g. re-arming a drag on the same node; the id does not actually change
    const node = buildVectorNode();
    const state = buildState({ [node.id]: node }, { vectorEditingNodeIds: [node.id] });

    // before
    handleSetVectorEditingNodeIds(state, [node.id]);

    // result
    expect(state.nodes[node.id]).toBeDefined();
  });

  it('should delete only the empty node that dropped out when two nodes were open and one exits', () => {
    // mock — two nodes open, the empty one closes while the populated one stays open
    const emptyNode = buildVectorNode({ id: 'vector-empty' });
    const populatedNode = buildVectorNode({
      id: 'vector-populated',
      segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } },
    });
    const state = buildState(
      { [emptyNode.id]: emptyNode, [populatedNode.id]: populatedNode },
      { vectorEditingNodeIds: [emptyNode.id, populatedNode.id] },
    );

    // before
    handleSetVectorEditingNodeIds(state, [populatedNode.id]);

    // result
    expect(state.vectorEditingNodeIds).toEqual([populatedNode.id]);
    expect(state.nodes[emptyNode.id]).toBeUndefined();
    expect(state.nodes[populatedNode.id]).toBeDefined();
  });

  it('should not delete a dropped-out node that already has a segment even alongside another that stays open', () => {
    // mock — both nodes populated, one closes, neither should be deleted
    const nodeA = buildVectorNode({
      id: 'vector-a',
      segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } },
    });
    const nodeB = buildVectorNode({
      id: 'vector-b',
      segments: { s2: { endId: 'v4', id: 's2', startId: 'v3', tangentEnd: null, tangentStart: null } },
      vertices: { v3: { id: 'v3', x: 0, y: 20 }, v4: { id: 'v4', x: 10, y: 20 } },
    });
    const state = buildState({ [nodeA.id]: nodeA, [nodeB.id]: nodeB }, { vectorEditingNodeIds: [nodeA.id, nodeB.id] });

    // before
    handleSetVectorEditingNodeIds(state, [nodeB.id]);

    // result
    expect(state.vectorEditingNodeIds).toEqual([nodeB.id]);
    expect(state.nodes[nodeA.id]).toBeDefined();
    expect(state.nodes[nodeB.id]).toBeDefined();
  });
});
