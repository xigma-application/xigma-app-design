// types
import { NodeType, ToolName } from 'types/design/enums';
import { TDesignPage, TDesignState } from '../../../types';
import { TFrameNode, TVectorNode } from 'types/design/types';

// utils
import { exitVectorEditingIfNeeded } from '../exitVectorEditingIfNeeded';
import { getActivePage } from '../../getActivePage';

const buildState = (nodes: TDesignPage['nodes'], overrides: Partial<TDesignState> = {}): TDesignState => ({
  activePageId: 'page-1',
  activeTool: ToolName.default,
  areRulersVisible: false,
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
  ...overrides,
});

const buildFrame = (overrides: Partial<TFrameNode> = {}): TFrameNode => ({
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

describe('exitVectorEditingIfNeeded', () => {
  it('should leave vectorEditingNodeIds and penActiveVertexId untouched when every editing node stays selected', () => {
    // mock
    const frame = buildFrame();
    const state = buildState({ [frame.id]: frame }, { penActiveVertexId: 'vertex-1', vectorEditingNodeIds: [frame.id] });

    // before
    exitVectorEditingIfNeeded(state, [frame.id]);

    // result
    expect(state.vectorEditingNodeIds).toEqual([frame.id]);
    expect(state.penActiveVertexId).toBe('vertex-1');
  });

  it('should remove only the ids that left the selection, keeping the rest editing', () => {
    // mock
    const frame = buildFrame();
    const other = buildFrame({ id: 'other' });
    const state = buildState({ [frame.id]: frame, other }, { vectorEditingNodeIds: [frame.id, 'other'] });

    // before
    exitVectorEditingIfNeeded(state, ['other']);

    // result
    expect(state.vectorEditingNodeIds).toEqual(['other']);
  });

  it('should clear penActiveVertexId once any editing node exits', () => {
    // mock
    const frame = buildFrame();
    const state = buildState({ [frame.id]: frame }, { penActiveVertexId: 'vertex-1', vectorEditingNodeIds: [frame.id] });

    // before
    exitVectorEditingIfNeeded(state, []);

    // result
    expect(state.penActiveVertexId).toBeNull();
  });

  it('should delete an exited node that is an empty vector node', () => {
    // mock
    const node = buildVectorNode();
    const state = buildState({ [node.id]: node }, { vectorEditingNodeIds: [node.id] });

    // before
    exitVectorEditingIfNeeded(state, []);

    // result
    expect(state.vectorEditingNodeIds).toEqual([]);
    expect(getActivePage(state).nodes[node.id]).toBeUndefined();
  });

  it('should not delete an exited node that already has a segment', () => {
    // mock
    const node = buildVectorNode({
      segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } },
    });
    const state = buildState({ [node.id]: node }, { vectorEditingNodeIds: [node.id] });

    // before
    exitVectorEditingIfNeeded(state, []);

    // result
    expect(state.vectorEditingNodeIds).toEqual([]);
    expect(getActivePage(state).nodes[node.id]).toBeDefined();
  });

  it('should delete an exited empty vector node even when it was never part of nextSelectedIds to begin with', () => {
    // mock — vectorEditingNodeIds and the selection can diverge (e.g. entered via double-click)
    const node = buildVectorNode();
    const state = buildState({ [node.id]: node }, { vectorEditingNodeIds: [node.id] });

    // before
    exitVectorEditingIfNeeded(state, ['unrelated-id']);

    // result
    expect(state.vectorEditingNodeIds).toEqual([]);
    expect(getActivePage(state).nodes[node.id]).toBeUndefined();
  });
});
