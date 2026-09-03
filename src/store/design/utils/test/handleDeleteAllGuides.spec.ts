// types
import { NodeType, ToolName } from 'types/design/enums';
import { TDesignState } from '../../types';
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { getActivePage } from '../getActivePage';
import { handleDeleteAllGuides } from '../handleDeleteAllGuides';

const frame = (id: string): TFrameNode => ({
  childIds: [],
  clipContent: true,
  fill: '#ff0000',
  height: 100,
  id,
  name: id,
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 100,
  x: 0,
  y: 0,
});

const buildState = (nodes: Record<string, TSceneNode> = {}): TDesignState => ({
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
  designHintLabelKey: null,
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
      guides: [
        { axis: 'x', id: 'page-guide-x', position: 10 },
        { axis: 'y', id: 'page-guide-y', position: 20 },
      ],
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
  vectorEditingNodeIds: [],
});

describe('handleDeleteAllGuides', () => {
  it('should drop every page guide on the given axis and keep the rest', () => {
    // mock
    const state = buildState();

    // before
    handleDeleteAllGuides(state, { axis: 'x' });

    // result
    expect(getActivePage(state).guides).toEqual([{ axis: 'y', id: 'page-guide-y', position: 20 }]);
  });

  it('should also drop that axis from every frame that carries guides', () => {
    // mock
    const state = buildState({
      frame: {
        ...frame('frame'),
        guides: [
          { axis: 'x', id: 'frame-guide-x', position: 5 },
          { axis: 'y', id: 'frame-guide-y', position: 15 },
        ],
      },
    });

    // before
    handleDeleteAllGuides(state, { axis: 'x' });

    // result
    const node = getActivePage(state).nodes.frame;

    expect(node.type === NodeType.frame && node.guides).toEqual([{ axis: 'y', id: 'frame-guide-y', position: 15 }]);
  });

  it('should leave a frame with no guides array untouched', () => {
    // mock
    const state = buildState({ frame: frame('frame') });

    // before
    handleDeleteAllGuides(state, { axis: 'x' });

    // result
    const node = getActivePage(state).nodes.frame;

    expect(node.type === NodeType.frame && node.guides).toBeUndefined();
  });
});
