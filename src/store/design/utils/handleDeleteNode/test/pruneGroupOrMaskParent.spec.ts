// types
import { NodeType, ToolName } from 'types/design/enums';
import { TDesignPage, TDesignState } from '../../../types';
import { TGroupNode, TRectangleNode } from 'types/design/types';

// utils
import { getActivePage } from '../../getActivePage';
import { pruneGroupOrMaskParent } from '../pruneGroupOrMaskParent';

const rect = (id: string, parentId: string | null, x = 0): TRectangleNode => ({
  fill: '#fff',
  height: 10,
  id,
  name: 'Rectangle',
  parentId,
  rotation: 0,
  type: NodeType.rectangle,
  width: 10,
  x,
  y: 0,
});

const group = (childIds: string[]): TGroupNode => ({
  childIds,
  height: 10,
  id: 'group-1',
  name: 'Group',
  parentId: null,
  rotation: 0,
  type: NodeType.group,
  width: 10,
  x: 0,
  y: 0,
});

const buildState = (page: Partial<TDesignPage>): TDesignState => ({
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
      nodes: {},
      paint: { color: '#d9d9d9', opacity: 100, type: 'solid' },
      rootOrder: [],
      selectedIds: [],
      viewport: { x: 0, y: 0, zoom: 1 },
      ...page,
    },
  },
  penActiveVertexId: null,
  preferences: {
    areAdditionalLabelsVisible: true,
    areFrameOutlinesVisible: false,
    areMaskOutlinesVisible: false,
    areRulersVisible: false,
  },
  revealedMinMax: { maxHeight: false, maxWidth: false, minHeight: false, minWidth: false },
  vectorEditingNodeIds: [],
});

describe('pruneGroupOrMaskParent', () => {
  it('should delete the parent when it has no children left', () => {
    // mock
    const state = buildState({ nodes: { 'group-1': group([]) } });
    const parent = getActivePage(state).nodes['group-1'] as TGroupNode;

    // action
    pruneGroupOrMaskParent(state, parent);

    // result
    expect(getActivePage(state).nodes['group-1']).toBeUndefined();
  });

  it('should resync the group bounds when it still has children', () => {
    // mock
    const b = rect('b', 'group-1', 90);
    const state = buildState({ nodes: { b, 'group-1': group(['b']) } });
    const parent = getActivePage(state).nodes['group-1'] as TGroupNode;

    // action
    pruneGroupOrMaskParent(state, parent);

    // result
    expect(getActivePage(state).nodes['group-1']).toMatchObject({ width: 10, x: 90 });
  });
});
