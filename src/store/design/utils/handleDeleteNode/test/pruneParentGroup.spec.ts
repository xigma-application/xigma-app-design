// types
import { NodeType, ToolName } from 'types/design/enums';
import { TDesignPage, TDesignState } from '../../../types';
import { TGroupNode, TRectangleNode } from 'types/design/types';

// utils
import { getActivePage } from '../../getActivePage';
import { pruneParentGroup } from '../pruneParentGroup';

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
      nodes: {},
      paintColor: '#d9d9d9',
      rootOrder: [],
      selectedIds: [],
      viewport: { x: 0, y: 0, zoom: 1 },
      ...page,
    },
  },
  penActiveVertexId: null,
  vectorEditingNodeIds: [],
});

describe('pruneParentGroup', () => {
  it('should do nothing when there is no parent id', () => {
    // mock
    const state = buildState({ nodes: {} });

    // action / result
    expect(() => pruneParentGroup(state, null, 'gone')).not.toThrow();
  });

  it('should do nothing when the parent is not a group', () => {
    // mock
    const state = buildState({ nodes: { frame: rect('frame', null) } });

    // action
    pruneParentGroup(state, 'frame', 'gone');

    // result
    expect(getActivePage(state).nodes.frame).toBeDefined();
  });

  it('should drop the child id and resync bounds when the group still has children', () => {
    // mock
    const state = buildState({
      nodes: { b: rect('b', 'group-1', 90), 'group-1': group(['a', 'b']) },
    });

    // action
    pruneParentGroup(state, 'group-1', 'a');

    // result
    const parent = getActivePage(state).nodes['group-1'] as TGroupNode;
    expect(parent.childIds).toEqual(['b']);
    expect(parent).toMatchObject({ width: 10, x: 90 });
  });

  it('should delete the parent group when its last child was removed', () => {
    // mock
    const state = buildState({ nodes: { 'group-1': group(['a']) } });

    // action
    pruneParentGroup(state, 'group-1', 'a');

    // result
    expect(getActivePage(state).nodes['group-1']).toBeUndefined();
  });
});
