// others
import { DEFAULT_MASK_GROUP_NAME } from '../../../constants';

// types
import { NodeType, ToolName } from 'types/design/enums';
import { TDesignPage, TDesignState } from '../../../types';
import { TGroupNode, TRectangleNode } from 'types/design/types';

// utils
import { getActivePage } from '../../getActivePage';
import { handleUseNodesAsMask } from '../handleUseNodesAsMask';

const buildRect = (overrides: Partial<TRectangleNode> = {}): TRectangleNode => ({
  fill: '#ff0000',
  height: 10,
  id: 'rect-1',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 10,
  x: 0,
  y: 0,
  ...overrides,
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

describe('handleUseNodesAsMask', () => {
  it('should wrap the selection in a "Mask group" and flag its lowest child as the mask', () => {
    // mock
    const a = buildRect({ id: 'a' });
    const b = buildRect({ id: 'b', x: 40 });
    const state = buildState({ nodes: { a, b }, rootOrder: ['a', 'b'], selectedIds: ['a', 'b'] });

    // action
    handleUseNodesAsMask(state, 'group-1');

    // result
    const page = getActivePage(state);
    const group = page.nodes['group-1'] as TGroupNode;
    expect(group.type).toBe(NodeType.group);
    expect(group.name).toBe(DEFAULT_MASK_GROUP_NAME);
    expect(group.childIds).toEqual(['a', 'b']);
    expect(page.nodes.a.isMask).toBe(true);
    expect(page.nodes.b.isMask).toBeUndefined();
    expect(page.selectedIds).toEqual(['group-1']);
  });

  it('should wrap a single selected node too', () => {
    // mock
    const a = buildRect({ id: 'a' });
    const state = buildState({ nodes: { a }, rootOrder: ['a'], selectedIds: ['a'] });

    // action
    handleUseNodesAsMask(state, 'group-1');

    // result
    const page = getActivePage(state);
    const group = page.nodes['group-1'] as TGroupNode;
    expect(group.name).toBe(DEFAULT_MASK_GROUP_NAME);
    expect(group.childIds).toEqual(['a']);
    expect(page.nodes.a.isMask).toBe(true);
  });

  it('should no-op when nothing is selected', () => {
    // mock
    const a = buildRect({ id: 'a' });
    const state = buildState({ nodes: { a }, rootOrder: ['a'], selectedIds: [] });

    // action
    handleUseNodesAsMask(state, 'group-1');

    // result
    const page = getActivePage(state);
    expect(page.nodes['group-1']).toBeUndefined();
    expect(page.nodes.a.isMask).toBeUndefined();
  });
});
