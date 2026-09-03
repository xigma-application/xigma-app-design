// types
import { NodeType, ToolName } from 'types/design/enums';
import { TDesignPage, TDesignState } from '../../../types';
import { TGroupNode, TRectangleNode } from 'types/design/types';

// utils
import { cascadeDeleteGroupChildren } from '../cascadeDeleteGroupChildren';
import { getActivePage } from '../../getActivePage';

const rect = (id: string, parentId: string | null = null): TRectangleNode => ({
  fill: '#fff',
  height: 10,
  id,
  name: 'Rectangle',
  parentId,
  rotation: 0,
  type: NodeType.rectangle,
  width: 10,
  x: 0,
  y: 0,
});

const group = (id: string, childIds: string[]): TGroupNode => ({
  childIds,
  height: 10,
  id,
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
  vectorEditingNodeIds: [],
});

describe('cascadeDeleteGroupChildren', () => {
  it('should delete every child of a group node', () => {
    // mock
    const state = buildState({
      nodes: { a: rect('a', 'group-1'), b: rect('b', 'group-1'), 'group-1': group('group-1', ['a', 'b']) },
    });

    // action
    cascadeDeleteGroupChildren(state, group('group-1', ['a', 'b']));

    // result
    const page = getActivePage(state);
    expect(page.nodes.a).toBeUndefined();
    expect(page.nodes.b).toBeUndefined();
  });

  it('should do nothing for a non-group node', () => {
    // mock
    const state = buildState({ nodes: { a: rect('a') } });

    // action
    cascadeDeleteGroupChildren(state, rect('a'));

    // result
    expect(getActivePage(state).nodes.a).toBeDefined();
  });
});
