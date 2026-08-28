// types
import { NodeType, ToolName } from 'types/design/enums';
import { TDesignState } from '../../types';
import { TEllipseNode, TFrameNode, TVectorNode } from 'types/design/types';

// utils
import { handleSetSelection } from '../handleSetSelection';

const buildState = (nodes: TDesignState['nodes'], selectedIds: string[], overrides: Partial<TDesignState> = {}): TDesignState => ({
  activeTool: ToolName.default,
  commentDraftPosition: null,
  comments: {},
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
  nodes,
  paintColor: '#d9d9d9',
  penActiveVertexId: null,
  rootOrder: Object.keys(nodes),
  selectedIds,
  vectorEditingNodeIds: [],
  viewport: { x: 0, y: 0, zoom: 1 },
  ...overrides,
});

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

const buildEllipse = (overrides: Partial<TEllipseNode> = {}): TEllipseNode => ({
  fill: '#ff0000',
  height: 10,
  id: 'ellipse-1',
  name: 'Ellipse',
  parentId: null,
  rotation: 0,
  type: NodeType.ellipse,
  width: 10,
  x: 0,
  y: 0,
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

describe('handleSetSelection', () => {
  it('should update selectedIds to the given list', () => {
    // mock
    const state = buildState({ [frame.id]: frame }, [frame.id]);

    // before
    handleSetSelection(state, []);

    // result
    expect(state.selectedIds).toEqual([]);
  });

  it('should not delete a deselected node that is not a fully cut-away ellipse', () => {
    // mock
    const state = buildState({ [frame.id]: frame }, [frame.id]);

    // before
    handleSetSelection(state, []);

    // result
    expect(state.nodes[frame.id]).toBeDefined();
  });

  it('should not delete a deselected ellipse with no arc angles set (defaults to a full circle)', () => {
    // mock — arcStartAngle/arcEndAngle default to the same value (a full, non-degenerate circle)
    const ellipse = buildEllipse();
    const state = buildState({ [ellipse.id]: ellipse }, [ellipse.id]);

    // before
    handleSetSelection(state, []);

    // result
    expect(state.nodes[ellipse.id]).toBeDefined();
  });

  it('should delete a deselected ellipse that is fully cut away', () => {
    // mock — arcStartAngle defaults to 90; a full 360° lap cut (arcEndAngle 450) collapses majorSweep to 0
    const ellipse = buildEllipse({ arcEndAngle: 450 });
    const state = buildState({ [ellipse.id]: ellipse }, [ellipse.id]);

    // before
    handleSetSelection(state, []);

    // result
    expect(state.nodes[ellipse.id]).toBeUndefined();
  });

  it('should not delete a fully cut-away ellipse that stays selected', () => {
    // mock
    const ellipse = buildEllipse({ arcEndAngle: 450 });
    const state = buildState({ [ellipse.id]: ellipse }, [ellipse.id]);

    // before
    handleSetSelection(state, [ellipse.id]);

    // result
    expect(state.nodes[ellipse.id]).toBeDefined();
  });

  it('should keep vectorEditingNodeIds when the vector node stays the sole selection', () => {
    // mock
    const state = buildState({ [frame.id]: frame }, [frame.id], { vectorEditingNodeIds: [frame.id] });

    // before
    handleSetSelection(state, [frame.id]);

    // result
    expect(state.vectorEditingNodeIds).toEqual([frame.id]);
  });

  it('should clear vectorEditingNodeIds and penActiveVertexId when the vector node leaves the selection', () => {
    // mock
    const state = buildState({ [frame.id]: frame }, [frame.id], { penActiveVertexId: 'vertex-1', vectorEditingNodeIds: [frame.id] });

    // before
    handleSetSelection(state, []);

    // result
    expect(state.vectorEditingNodeIds).toEqual([]);
    expect(state.penActiveVertexId).toBeNull();
  });

  it('should keep vectorEditingNodeIds when the vector node stays selected but joins a wider selection', () => {
    // mock — new semantics: only ids that actually left the selection exit editing
    const other = { ...frame, id: 'other' };
    const state = buildState({ [frame.id]: frame, other }, [frame.id], {
      penActiveVertexId: 'vertex-1',
      vectorEditingNodeIds: [frame.id],
    });

    // before
    handleSetSelection(state, [frame.id, 'other']);

    // result
    expect(state.vectorEditingNodeIds).toEqual([frame.id]);
    expect(state.penActiveVertexId).toBe('vertex-1');
  });

  it('should exit editing only for the node that left the selection, keeping the other open node untouched', () => {
    // mock — two nodes open for editing, only one gets deselected
    const other = { ...frame, id: 'other' };
    const state = buildState({ [frame.id]: frame, other }, [frame.id, 'other'], {
      vectorEditingNodeIds: [frame.id, 'other'],
    });

    // before
    handleSetSelection(state, ['other']);

    // result
    expect(state.vectorEditingNodeIds).toEqual(['other']);
  });

  it('should exit editing for every open node when the whole selection is cleared', () => {
    // mock
    const other = { ...frame, id: 'other' };
    const state = buildState({ [frame.id]: frame, other }, [frame.id, 'other'], {
      vectorEditingNodeIds: [frame.id, 'other'],
    });

    // before
    handleSetSelection(state, []);

    // result
    expect(state.vectorEditingNodeIds).toEqual([]);
  });

  it('should delete a deselected vector node that never got any segments drawn', () => {
    // mock — the abandoned-first-click case: one vertex, no segments
    const node = buildVectorNode();
    const state = buildState({ [node.id]: node }, [node.id]);

    // before
    handleSetSelection(state, []);

    // result
    expect(state.nodes[node.id]).toBeUndefined();
  });

  it('should not delete a deselected vector node that already has a segment', () => {
    // mock
    const node = buildVectorNode({
      segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } },
    });
    const state = buildState({ [node.id]: node }, [node.id]);

    // before
    handleSetSelection(state, []);

    // result
    expect(state.nodes[node.id]).toBeDefined();
  });

  it('should delete the vector-editing node once its edit mode exits, when it never got any segments drawn', () => {
    // mock — Escape/selecting a different node while an empty just-clicked vector node is still open
    const node = buildVectorNode();
    const other = { ...frame, id: 'other' };
    const state = buildState({ [node.id]: node, other }, [node.id], { vectorEditingNodeIds: [node.id] });

    // before
    handleSetSelection(state, [other.id]);

    // result
    expect(state.vectorEditingNodeIds).toEqual([]);
    expect(state.nodes[node.id]).toBeUndefined();
  });

  it('should delete an empty vector-editing node on exit even when it was never part of selectedIds', () => {
    // mock — vectorEditingNodeIds and selectedIds can diverge (e.g. entered via double-click without
    // also being selected); this exercises exitVectorEditingIfNeeded's own delete path, distinct from
    // deleteDegenerateDeselectedNodes which only ever looks at selectedIds
    const node = buildVectorNode();
    const state = buildState({ [node.id]: node }, [], { vectorEditingNodeIds: [node.id] });

    // before
    handleSetSelection(state, []);

    // result
    expect(state.vectorEditingNodeIds).toEqual([]);
    expect(state.nodes[node.id]).toBeUndefined();
  });

  it('should not delete the vector-editing node once its edit mode exits, when it already has a segment', () => {
    // mock
    const node = buildVectorNode({
      segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } },
    });
    const other = { ...frame, id: 'other' };
    const state = buildState({ [node.id]: node, other }, [node.id], { vectorEditingNodeIds: [node.id] });

    // before
    handleSetSelection(state, [other.id]);

    // result
    expect(state.vectorEditingNodeIds).toEqual([]);
    expect(state.nodes[node.id]).toBeDefined();
  });
});
