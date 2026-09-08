// types
import { NodeType, ToolName } from 'types/design/enums';
import { TDesignPage, TDesignState } from '../../../types';
import { TGroupNode, TMaskNode, TRectangleNode } from 'types/design/types';

// utils
import { getActivePage } from '../../getActivePage';
import { handleRemoveNodeMask } from '../handleRemoveNodeMask';

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
      rootOrder: Object.keys(nodes).filter((id) => !nodes[id].parentId),
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
  revealedMinMax: { maxHeight: false, maxWidth: false, minHeight: false, minWidth: false },
  vectorEditingNodeIds: [],
});

const buildRectangle = (overrides: Partial<TRectangleNode> = {}): TRectangleNode => ({
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

const buildMask = (overrides: Partial<TMaskNode> = {}): TMaskNode => ({
  childIds: [],
  height: 10,
  id: 'mask-1',
  name: 'Mask group',
  parentId: null,
  rotation: 0,
  type: NodeType.mask,
  width: 10,
  x: 0,
  y: 0,
  ...overrides,
});

const buildGroup = (overrides: Partial<TGroupNode> = {}): TGroupNode => ({
  childIds: [],
  height: 10,
  id: 'group-1',
  name: 'Group',
  parentId: null,
  rotation: 0,
  type: NodeType.group,
  width: 10,
  x: 0,
  y: 0,
  ...overrides,
});

describe('handleRemoveNodeMask', () => {
  it('should convert the mask container back to a plain group when the current mask child is removed', () => {
    // mock — 'top' is the last child of the mask, i.e. the current mask shape; the container's own
    // box starts out matching just 'top' (mask semantics), well short of the union with 'bottom'
    const bottom = buildRectangle({ id: 'bottom', parentId: 'mask-1', x: 0 });
    const top = buildRectangle({ id: 'top', parentId: 'mask-1', x: 40 });
    const mask = buildMask({ childIds: ['bottom', 'top'], height: 10, width: 10, x: 40, y: 0 });
    const state = buildState({ [bottom.id]: bottom, [mask.id]: mask, [top.id]: top });

    // action
    handleRemoveNodeMask(state, top.id);

    // result
    const page = getActivePage(state);
    const converted = page.nodes[mask.id] as TGroupNode;
    expect(converted.type).toBe(NodeType.group);
    expect(converted.childIds).toEqual(['bottom', 'top']);
    // back to plain-group semantics — the box widens to the union of both children again
    expect(converted).toMatchObject({ height: 10, width: 50, x: 0, y: 0 });
  });

  it('should do nothing when the node is not the current (last) mask child', () => {
    // mock — removing mask via a node that isn't the topmost child
    const bottom = buildRectangle({ id: 'bottom', parentId: 'mask-1' });
    const top = buildRectangle({ id: 'top', parentId: 'mask-1' });
    const mask = buildMask({ childIds: ['bottom', 'top'] });
    const state = buildState({ [bottom.id]: bottom, [mask.id]: mask, [top.id]: top });

    // action
    handleRemoveNodeMask(state, bottom.id);

    // result
    expect(getActivePage(state).nodes[mask.id].type).toBe(NodeType.mask);
  });

  it('should do nothing when the parent is a plain group, not a mask', () => {
    // mock
    const rect = buildRectangle({ parentId: 'group-1' });
    const group = buildGroup({ childIds: [rect.id] });
    const state = buildState({ 'group-1': group, [rect.id]: rect });

    // action
    handleRemoveNodeMask(state, rect.id);

    // result
    expect(getActivePage(state).nodes['group-1'].type).toBe(NodeType.group);
  });

  it('should do nothing for a top-level node with no parent', () => {
    // mock
    const rect = buildRectangle();
    const state = buildState({ [rect.id]: rect });

    // action
    expect(() => handleRemoveNodeMask(state, rect.id)).not.toThrow();
  });

  it('should no-op for an unknown node id', () => {
    // mock
    const rect = buildRectangle();
    const state = buildState({ [rect.id]: rect });

    // action
    expect(() => handleRemoveNodeMask(state, 'missing-id')).not.toThrow();
  });
});
