// types
import { NodeType, PathType, ToolName } from 'types/design/enums';
import { TDesignState } from '../../types';
import { TFrameNode, TPathNode, TTextNode } from 'types/design/types';

// utils
import { handleDeleteNode } from '../handleDeleteNode';

const node: TFrameNode = {
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

const buildState = (nodes: TDesignState['nodes'], selectedIds: string[] = []): TDesignState => ({
  activeTool: ToolName.default,
  commentDraftPosition: null,
  comments: {},
  editingNodeId: null,
  editingSelectionChangedAt: 0,
  editingSelectionEnd: 0,
  editingSelectionStart: 0,
  editingTextBox: null,
  editingTextContent: '',
  lastFrameTool: ToolName.frame,
  lastMouseTool: ToolName.default,
  lastPenTool: ToolName.pen,
  lastShapeTool: ToolName.rectangle,
  lastTextTool: ToolName.text,
  nodes,
  rootOrder: Object.keys(nodes),
  selectedIds,
  viewport: { x: 0, y: 0, zoom: 1 },
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
    expect(state.nodes[node.id]).toBeUndefined();
    expect(state.rootOrder).toEqual([]);
  });

  it('should also remove the deleted id from selectedIds when it was selected', () => {
    // mock
    const state = buildState({ [node.id]: { ...node } }, [node.id]);

    // before
    handleDeleteNode(state, node.id);

    // result
    expect(state.selectedIds).toEqual([]);
  });

  it('should leave an unrelated selection untouched', () => {
    // mock
    const other = { ...node, id: 'other' };
    const state = buildState({ [node.id]: { ...node }, other }, ['other']);

    // before
    handleDeleteNode(state, node.id);

    // result
    expect(state.selectedIds).toEqual(['other']);
  });

  it('should do nothing when the node does not exist', () => {
    // mock
    const state = buildState({});

    // before
    handleDeleteNode(state, 'missing');

    // result
    expect(state.nodes).toEqual({});
    expect(state.rootOrder).toEqual([]);
  });

  it('should cascade-delete the bound path node when deleting a path-text node', () => {
    // mock
    const pathNode = buildPathNode();
    const textNode = buildPathText();
    const state = buildState({ [pathNode.id]: pathNode, [textNode.id]: textNode });

    // before
    handleDeleteNode(state, textNode.id);

    // result
    expect(state.nodes[textNode.id]).toBeUndefined();
    expect(state.nodes[pathNode.id]).toBeUndefined();
    expect(state.rootOrder).toEqual([]);
  });

  it('should cascade-delete the bound text node when deleting a path node directly', () => {
    // mock
    const pathNode = buildPathNode();
    const textNode = buildPathText();
    const state = buildState({ [pathNode.id]: pathNode, [textNode.id]: textNode });

    // before
    handleDeleteNode(state, pathNode.id);

    // result
    expect(state.nodes[pathNode.id]).toBeUndefined();
    expect(state.nodes[textNode.id]).toBeUndefined();
    expect(state.rootOrder).toEqual([]);
  });

  it('should not touch any other node when deleting a plain text node with no path binding', () => {
    // mock
    const plainText = buildPathText({ id: 'text-2', pathId: null });
    const other = { ...node, id: 'other' };
    const state = buildState({ [plainText.id]: plainText, other });

    // before
    handleDeleteNode(state, plainText.id);

    // result
    expect(state.nodes[plainText.id]).toBeUndefined();
    expect(state.nodes.other).toBeDefined();
  });
});
