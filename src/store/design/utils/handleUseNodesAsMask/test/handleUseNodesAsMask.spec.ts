// others
import { DEFAULT_MASK_GROUP_NAME } from '../../../constants';

// types
import { NodeType, ToolName } from 'types/design/enums';
import { TDesignPage, TDesignState } from '../../../types';
import { TFrameNode, TMaskNode, TRectangleNode } from 'types/design/types';

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

describe('handleUseNodesAsMask', () => {
  it('should wrap the selection in a "Mask group" node, whose last child is the mask', () => {
    // mock
    const a = buildRect({ id: 'a' });
    const b = buildRect({ id: 'b', x: 40 });
    const state = buildState({ nodes: { a, b }, rootOrder: ['a', 'b'], selectedIds: ['a', 'b'] });

    // action
    handleUseNodesAsMask(state, 'group-1');

    // result
    const page = getActivePage(state);
    const mask = page.nodes['group-1'] as TMaskNode;
    expect(mask.type).toBe(NodeType.mask);
    expect(mask.name).toBe(DEFAULT_MASK_GROUP_NAME);
    expect(mask.childIds).toEqual(['a', 'b']);
    expect(page.selectedIds).toEqual(['b']);
    // the container's own box must match the mask shape 'b' alone, not the union with 'a'
    expect(mask).toMatchObject({ height: 10, width: 10, x: 40, y: 0 });
  });

  it('should wrap a single selected node too', () => {
    // mock
    const a = buildRect({ id: 'a' });
    const state = buildState({ nodes: { a }, rootOrder: ['a'], selectedIds: ['a'] });

    // action
    handleUseNodesAsMask(state, 'group-1');

    // result
    const page = getActivePage(state);
    const mask = page.nodes['group-1'] as TMaskNode;
    expect(mask.type).toBe(NodeType.mask);
    expect(mask.name).toBe(DEFAULT_MASK_GROUP_NAME);
    expect(mask.childIds).toEqual(['a']);
    expect(page.selectedIds).toEqual(['a']);
  });

  it('should reorder a trailing frame out of the mask position, since a frame can never be the mask', () => {
    // mock — a frame is last in z-order, but frames can never become the mask
    const a = buildRect({ id: 'a' });
    const b = buildFrame({ id: 'b' });
    const state = buildState({ nodes: { a, b }, rootOrder: ['a', 'b'], selectedIds: ['a', 'b'] });

    // action
    handleUseNodesAsMask(state, 'group-1');

    // result — 'a' (the rectangle) ends up last, so it's the effective mask
    const page = getActivePage(state);
    const mask = page.nodes['group-1'] as TMaskNode;
    expect(mask.childIds).toEqual(['b', 'a']);
    expect(page.selectedIds).toEqual(['a']);
  });

  it('should leave the order untouched when every child is a layout container (no valid alternative)', () => {
    // mock — both children are frames, so there is no non-container candidate to swap in as the mask
    const a = buildFrame({ id: 'a' });
    const b = buildFrame({ id: 'b', x: 40 });
    const state = buildState({ nodes: { a, b }, rootOrder: ['a', 'b'], selectedIds: ['a', 'b'] });

    // action
    handleUseNodesAsMask(state, 'group-1');

    // result
    const page = getActivePage(state);
    const mask = page.nodes['group-1'] as TMaskNode;
    expect(mask.childIds).toEqual(['a', 'b']);
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
  });
});
