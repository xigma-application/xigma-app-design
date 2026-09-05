// types
import { NodeType, ToolName } from 'types/design/enums';
import { TDesignPage, TDesignState } from '../../../types';
import { TEllipseNode, TFrameNode, TVectorNode } from 'types/design/types';

// utils
import { deleteDegenerateDeselectedNodes } from '../deleteDegenerateDeselectedNodes';
import { getActivePage } from '../../getActivePage';

const buildState = (nodes: TDesignPage['nodes']): TDesignState => ({
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
      nodes,
      paint: { color: '#d9d9d9', opacity: 100, type: 'solid' },
      rootOrder: Object.keys(nodes),
      selectedIds: [],
      viewport: { x: 0, y: 0, zoom: 1 },
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

const buildFrame = (overrides: Partial<TFrameNode> = {}): TFrameNode => ({
  childIds: [],
  clipContent: true,
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
  defaultFill: null,
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

describe('deleteDegenerateDeselectedNodes', () => {
  it('should do nothing when the deselected ids list is empty', () => {
    // mock
    const frame = buildFrame();
    const state = buildState({ [frame.id]: frame });

    // before
    deleteDegenerateDeselectedNodes(state, []);

    // result
    expect(getActivePage(state).nodes[frame.id]).toBeDefined();
  });

  it('should not delete a deselected node that is neither a fully cut-away ellipse nor an empty vector node', () => {
    // mock
    const frame = buildFrame();
    const state = buildState({ [frame.id]: frame });

    // before
    deleteDegenerateDeselectedNodes(state, [frame.id]);

    // result
    expect(getActivePage(state).nodes[frame.id]).toBeDefined();
  });

  it('should delete a deselected ellipse that is fully cut away', () => {
    // mock — arcStartAngle defaults to 90; a full 360° lap cut (arcEndAngle 450) collapses majorSweep to 0
    const ellipse = buildEllipse({ arcEndAngle: 450 });
    const state = buildState({ [ellipse.id]: ellipse });

    // before
    deleteDegenerateDeselectedNodes(state, [ellipse.id]);

    // result
    expect(getActivePage(state).nodes[ellipse.id]).toBeUndefined();
  });

  it('should delete a deselected vector node that has no segments', () => {
    // mock
    const node = buildVectorNode();
    const state = buildState({ [node.id]: node });

    // before
    deleteDegenerateDeselectedNodes(state, [node.id]);

    // result
    expect(getActivePage(state).nodes[node.id]).toBeUndefined();
  });

  it('should not delete a deselected vector node that already has a segment', () => {
    // mock
    const node = buildVectorNode({
      segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } },
    });
    const state = buildState({ [node.id]: node });

    // before
    deleteDegenerateDeselectedNodes(state, [node.id]);

    // result
    expect(getActivePage(state).nodes[node.id]).toBeDefined();
  });

  it('should only delete the degenerate nodes out of a mixed list of deselected ids', () => {
    // mock
    const frame = buildFrame();
    const ellipse = buildEllipse({ arcEndAngle: 450 });
    const vector = buildVectorNode();
    const state = buildState({ [ellipse.id]: ellipse, [frame.id]: frame, [vector.id]: vector });

    // before
    deleteDegenerateDeselectedNodes(state, [frame.id, ellipse.id, vector.id]);

    // result
    expect(getActivePage(state).nodes[frame.id]).toBeDefined();
    expect(getActivePage(state).nodes[ellipse.id]).toBeUndefined();
    expect(getActivePage(state).nodes[vector.id]).toBeUndefined();
  });
});
