// types
import { NodeType, ToolName } from 'types/design/enums';
import { TDesignSnapshot, TDesignState } from '../../types';
import { TFrameNode, TRectangleNode, TSceneNode, TVectorNode } from 'types/design/types';

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
  defaultFill: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
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
  vertices: { 'vertex-1': { id: 'vertex-1', x: 0, y: 0 } },
  ...overrides,
});

const buildState = (overrides: Partial<TDesignState> = {}): TDesignState => ({
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
  ...overrides,
});

type TSnapshotOverrides = {
  activePageId?: string;
  nodes?: Record<string, TSceneNode>;
  rootOrder?: string[];
  selectedIds?: string[];
};

const buildSnapshot = ({
  activePageId = 'page-1',
  nodes = {},
  rootOrder = [],
  selectedIds = [],
}: TSnapshotOverrides = {}): TDesignSnapshot => ({
  activePageId,
  pages: {
    [activePageId]: {
      comments: {},
      guides: [],
      id: activePageId,
      name: 'Page 1',
      nodes,
      paint: { color: '#d9d9d9', opacity: 100, type: 'solid' },
      rootOrder,
      selectedIds,
      viewport: { x: 0, y: 0, zoom: 1 },
    },
  },
});

describe('handleReplaceDesignSnapshot', () => {
  it('should restore the whole pages record and the active page id from the snapshot', () => {
    // mock
    const state = buildState();
    const snapshot = buildSnapshot({ activePageId: 'restored-page', nodes: { [frame.id]: frame }, rootOrder: [frame.id] });

    // before
    handleReplaceDesignSnapshot(state, snapshot);

    // result
    expect(state.activePageId).toBe('restored-page');
    expect(Object.keys(state.pages)).toEqual(['restored-page']);
    expect(state.pages['restored-page'].nodes).toEqual({ [frame.id]: frame });
  });

  it('should restore nodes, rootOrder and selectedIds from the snapshot', () => {
    // mock
    const state = buildState();
    const snapshot = buildSnapshot({ nodes: { [frame.id]: frame }, rootOrder: [frame.id], selectedIds: [frame.id] });

    // before
    handleReplaceDesignSnapshot(state, snapshot);

    // result
    expect(state.pages[state.activePageId].nodes).toEqual({ [frame.id]: frame });
    expect(state.pages[state.activePageId].rootOrder).toEqual([frame.id]);
    expect(state.pages[state.activePageId].selectedIds).toEqual([frame.id]);
  });

  it('should keep vectorEditingNodeIds and penActiveVertexId when the restored node still has the active vertex', () => {
    // mock
    const vector = buildVectorNode();
    const state = buildState({ penActiveVertexId: 'vertex-1', vectorEditingNodeIds: [vector.id] });
    const snapshot = buildSnapshot({ nodes: { [vector.id]: vector } });

    // before
    handleReplaceDesignSnapshot(state, snapshot);

    // result
    expect(state.vectorEditingNodeIds).toEqual([vector.id]);
    expect(state.penActiveVertexId).toBe('vertex-1');
  });

  it('should clear vectorEditingNodeIds and penActiveVertexId when the restored snapshot no longer has that node', () => {
    // mock
    const vector = buildVectorNode();
    const state = buildState({ penActiveVertexId: 'vertex-1', vectorEditingNodeIds: [vector.id] });
    const snapshot = buildSnapshot({ nodes: {} });

    // before
    handleReplaceDesignSnapshot(state, snapshot);

    // result
    expect(state.vectorEditingNodeIds).toEqual([]);
    expect(state.penActiveVertexId).toBeNull();
  });

  it('should reset activeTool back to default when an undo/redo drops vectorEditingNodeIds to empty (e.g. a converted vector reverted to its original shape type)', () => {
    // mock — mirrors what an undo of Enter's shape-to-vector conversion looks like: the node that
    // was open for editing is no longer NodeType.vector in the restored snapshot
    const vector = buildVectorNode();
    const rectangle: TRectangleNode = {
      fill: '#ff0000',
      height: 40,
      id: vector.id,
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: 40,
      x: 0,
      y: 0,
    };
    const state = buildState({ activeTool: ToolName.move, vectorEditingNodeIds: [vector.id] });
    const snapshot = buildSnapshot({ nodes: { [vector.id]: rectangle }, rootOrder: [vector.id] });

    // before
    handleReplaceDesignSnapshot(state, snapshot);

    // result
    expect(state.vectorEditingNodeIds).toEqual([]);
    expect(state.activeTool).toBe(ToolName.default);
  });

  it('should not touch activeTool when vectorEditingNodeIds was already empty before the restore', () => {
    // mock
    const state = buildState({ activeTool: ToolName.hand, vectorEditingNodeIds: [] });
    const snapshot = buildSnapshot();

    // before
    handleReplaceDesignSnapshot(state, snapshot);

    // result
    expect(state.activeTool).toBe(ToolName.hand);
  });

  it('should not touch activeTool when at least one vector-editing node survives the restore', () => {
    // mock
    const survivor = buildVectorNode({ id: 'vector-survivor' });
    const removed = buildVectorNode({ id: 'vector-removed' });
    const state = buildState({ activeTool: ToolName.move, vectorEditingNodeIds: [removed.id, survivor.id] });
    const snapshot = buildSnapshot({ nodes: { [survivor.id]: survivor } });

    // before
    handleReplaceDesignSnapshot(state, snapshot);

    // result
    expect(state.vectorEditingNodeIds).toEqual([survivor.id]);
    expect(state.activeTool).toBe(ToolName.move);
  });

  it('should clear penActiveVertexId when the restored primary node no longer has that vertex', () => {
    // mock
    const vector = buildVectorNode();
    const state = buildState({ penActiveVertexId: 'vertex-stale', vectorEditingNodeIds: [vector.id] });
    const snapshot = buildSnapshot({ nodes: { [vector.id]: vector } });

    // before
    handleReplaceDesignSnapshot(state, snapshot);

    // result
    expect(state.vectorEditingNodeIds).toEqual([vector.id]);
    expect(state.penActiveVertexId).toBeNull();
  });

  it('should keep the same vectorEditingNodeIds array reference when nothing needs pruning — components reading it via useSelector must not spuriously re-render on every undo/redo', () => {
    // mock
    const vector = buildVectorNode();
    const state = buildState({ vectorEditingNodeIds: [vector.id] });
    const originalVectorEditingNodeIds = state.vectorEditingNodeIds;
    const snapshot = buildSnapshot({ nodes: { [vector.id]: vector } });

    // before
    handleReplaceDesignSnapshot(state, snapshot);

    // result
    expect(state.vectorEditingNodeIds).toBe(originalVectorEditingNodeIds);
  });

  it('should keep only the open node that survives an undo when two were open and one got removed', () => {
    // mock — two nodes open for editing, the undo/redo snapshot only brings one of them back
    const survivor = buildVectorNode({ id: 'vector-survivor' });
    const removed = buildVectorNode({ id: 'vector-removed' });
    const state = buildState({ vectorEditingNodeIds: [removed.id, survivor.id] });
    const snapshot = buildSnapshot({ nodes: { [survivor.id]: survivor } });

    // before
    handleReplaceDesignSnapshot(state, snapshot);

    // result
    expect(state.vectorEditingNodeIds).toEqual([survivor.id]);
  });
});
