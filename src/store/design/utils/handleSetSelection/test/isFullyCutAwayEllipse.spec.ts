// types
import { NodeType, ToolName } from 'types/design/enums';
import { TDesignPage, TDesignState } from '../../../types';
import { TEllipseNode, TFrameNode } from 'types/design/types';

// utils
import { isFullyCutAwayEllipse } from '../isFullyCutAwayEllipse';

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

describe('isFullyCutAwayEllipse', () => {
  it('should return false for an id that does not exist', () => {
    // mock
    const state = buildState({});

    // action & result
    expect(isFullyCutAwayEllipse(state, 'missing')).toBe(false);
  });

  it('should return false for a node that is not an ellipse', () => {
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

    // action & result
    expect(isFullyCutAwayEllipse(state, frame.id)).toBe(false);
  });

  it('should return false for an ellipse with no arc angles set (defaults to a full circle)', () => {
    // mock
    const ellipse = buildEllipse();
    const state = buildState({ [ellipse.id]: ellipse });

    // action & result
    expect(isFullyCutAwayEllipse(state, ellipse.id)).toBe(false);
  });

  it('should return true for an ellipse whose arc is cut away to nothing', () => {
    // mock — arcStartAngle defaults to 90; a full 360° lap cut (arcEndAngle 450) collapses majorSweep to 0
    const ellipse = buildEllipse({ arcEndAngle: 450 });
    const state = buildState({ [ellipse.id]: ellipse });

    // action & result
    expect(isFullyCutAwayEllipse(state, ellipse.id)).toBe(true);
  });
});
