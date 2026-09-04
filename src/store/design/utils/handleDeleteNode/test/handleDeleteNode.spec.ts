// types
import { NodeType, PathType, ToolName } from 'types/design/enums';
import { TDesignPage, TDesignState } from '../../../types';
import { TFrameNode, TGroupNode, TPathNode, TRectangleNode, TTextNode } from 'types/design/types';

// utils
import { getActivePage } from '../../getActivePage';
import { handleDeleteNode } from '../handleDeleteNode';

const node: TFrameNode = {
  childIds: [],
  clipContent: true,
  fill: '#ff0000',
  height: 10,
  id: 'node-1',
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 10,
  x: 0,
  y: 0,
};

const buildState = (nodes: TDesignPage['nodes'], selectedIds: string[] = []): TDesignState => ({
  activePageId: 'page-1',
  activeTool: ToolName.default,
  preferences: {
    areAdditionalLabelsVisible: true,
    areFrameOutlinesVisible: false,
    areMaskOutlinesVisible: false,
    areRulersVisible: false,
  },
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
      backgroundPaint: { color: '#d9d9d9', opacity: 100, type: 'solid' },
      comments: {},
      guides: [],
      id: 'page-1',
      name: 'Page 1',
      nodes,
      paint: { color: '#d9d9d9', opacity: 100, type: 'solid' },
      rootOrder: Object.keys(nodes),
      selectedIds,
      viewport: { x: 0, y: 0, zoom: 1 },
    },
  },
  penActiveVertexId: null,
  vectorEditingNodeIds: [],
});

const buildPathNode = (overrides: Partial<TPathNode> = {}): TPathNode => ({
  height: 200,
  id: 'path-1',
  name: 'Path',
  parentId: null,
  pathType: PathType.ellipse,
  rotation: 0,
  type: NodeType.path,
  width: 200,
  x: 0,
  y: 0,
  ...overrides,
});

const buildPathText = (overrides: Partial<TTextNode> = {}): TTextNode => ({
  content: 'Hi',
  fill: '#ffffff',
  flipX: false,
  flipY: false,
  fontFamily: 'Inter',
  fontSize: 14,
  height: 200,
  id: 'text-1',
  name: 'Text',
  parentId: null,
  pathId: 'path-1',
  pathStartOffset: 0,
  rotation: 0,
  type: NodeType.text,
  width: 200,
  x: 0,
  y: 0,
  ...overrides,
});

describe('handleDeleteNode', () => {
  it('should remove an existing node from nodes and rootOrder', () => {
    // mock
    const state = buildState({ [node.id]: { ...node } });

    // before
    handleDeleteNode(state, node.id);

    // result
    expect(getActivePage(state).nodes[node.id]).toBeUndefined();
    expect(getActivePage(state).rootOrder).toEqual([]);
  });

  it('should drop a frame’s guides along with the frame', () => {
    // mock
    const framed: TFrameNode = { ...node, guides: [{ axis: 'x', id: 'g1', position: 5 }] };
    const state = buildState({ [framed.id]: framed });

    // before
    handleDeleteNode(state, framed.id);

    // result
    expect(getActivePage(state).nodes[framed.id]).toBeUndefined();
  });

  it('should also remove the deleted id from selectedIds when it was selected', () => {
    // mock
    const state = buildState({ [node.id]: { ...node } }, [node.id]);

    // before
    handleDeleteNode(state, node.id);

    // result
    expect(getActivePage(state).selectedIds).toEqual([]);
  });

  it('should leave an unrelated selection untouched', () => {
    // mock
    const other = { ...node, id: 'other' };
    const state = buildState({ [node.id]: { ...node }, other }, ['other']);

    // before
    handleDeleteNode(state, node.id);

    // result
    expect(getActivePage(state).selectedIds).toEqual(['other']);
  });

  it('should do nothing when the node does not exist', () => {
    // mock
    const state = buildState({});

    // before
    handleDeleteNode(state, 'missing');

    // result
    expect(getActivePage(state).nodes).toEqual({});
    expect(getActivePage(state).rootOrder).toEqual([]);
  });

  it('should cascade-delete the bound path node when deleting a path-text node', () => {
    // mock
    const pathNode = buildPathNode();
    const textNode = buildPathText();
    const state = buildState({ [pathNode.id]: pathNode, [textNode.id]: textNode });

    // before
    handleDeleteNode(state, textNode.id);

    // result
    expect(getActivePage(state).nodes[textNode.id]).toBeUndefined();
    expect(getActivePage(state).nodes[pathNode.id]).toBeUndefined();
    expect(getActivePage(state).rootOrder).toEqual([]);
  });

  it('should cascade-delete the bound text node when deleting a path node directly', () => {
    // mock
    const pathNode = buildPathNode();
    const textNode = buildPathText();
    const state = buildState({ [pathNode.id]: pathNode, [textNode.id]: textNode });

    // before
    handleDeleteNode(state, pathNode.id);

    // result
    expect(getActivePage(state).nodes[pathNode.id]).toBeUndefined();
    expect(getActivePage(state).nodes[textNode.id]).toBeUndefined();
    expect(getActivePage(state).rootOrder).toEqual([]);
  });

  it('should not touch any other node when deleting a plain text node with no path binding', () => {
    // mock
    const plainText = buildPathText({ id: 'text-2', pathId: null });
    const other = { ...node, id: 'other' };
    const state = buildState({ [plainText.id]: plainText, other });

    // before
    handleDeleteNode(state, plainText.id);

    // result
    expect(getActivePage(state).nodes[plainText.id]).toBeUndefined();
    expect(getActivePage(state).nodes.other).toBeDefined();
  });

  it('should cascade-delete every child when deleting a group', () => {
    // mock
    const child: TRectangleNode = { ...node, id: 'child', parentId: 'group-1', type: NodeType.rectangle };
    const group: TGroupNode = {
      childIds: ['child'],
      height: 10,
      id: 'group-1',
      name: 'Group',
      parentId: null,
      rotation: 0,
      type: NodeType.group,
      width: 10,
      x: 0,
      y: 0,
    };
    const state = buildState({ child, 'group-1': group });

    // before
    handleDeleteNode(state, 'group-1');

    // result
    expect(getActivePage(state).nodes['group-1']).toBeUndefined();
    expect(getActivePage(state).nodes.child).toBeUndefined();
  });

  it('should dissolve the parent group when its last child is deleted', () => {
    // mock
    const child: TRectangleNode = { ...node, id: 'child', parentId: 'group-1', type: NodeType.rectangle };
    const group: TGroupNode = {
      childIds: ['child'],
      height: 10,
      id: 'group-1',
      name: 'Group',
      parentId: null,
      rotation: 0,
      type: NodeType.group,
      width: 10,
      x: 0,
      y: 0,
    };
    const state = buildState({ child, 'group-1': group });

    // before
    handleDeleteNode(state, 'child');

    // result
    expect(getActivePage(state).nodes.child).toBeUndefined();
    expect(getActivePage(state).nodes['group-1']).toBeUndefined();
  });

  it('should keep the parent group and resync its bounds when a non-last child is deleted', () => {
    // mock
    const first: TRectangleNode = { ...node, id: 'first', parentId: 'group-1', type: NodeType.rectangle, width: 10, x: 0 };
    const second: TRectangleNode = { ...node, id: 'second', parentId: 'group-1', type: NodeType.rectangle, width: 10, x: 90 };
    const group: TGroupNode = {
      childIds: ['first', 'second'],
      height: 10,
      id: 'group-1',
      name: 'Group',
      parentId: null,
      rotation: 0,
      type: NodeType.group,
      width: 100,
      x: 0,
      y: 0,
    };
    const state = buildState({ first, 'group-1': group, second });

    // before
    handleDeleteNode(state, 'first');

    // result
    const remaining = getActivePage(state).nodes['group-1'] as TGroupNode;
    expect(remaining.childIds).toEqual(['second']);
    expect(remaining).toMatchObject({ width: 10, x: 90 });
  });
});
