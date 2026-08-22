// types
import { NodeType, PathType, ToolName } from 'types/design/enums';
import { TDesignState } from '../../types';
import { TFrameNode, TPathNode, TTextNode } from 'types/design/types';

// utils
import { handleUpdateNode } from '../handleUpdateNode';

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

const buildState = (nodes: TDesignState['nodes']): TDesignState => ({
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
  penActiveVertexId: null,
  rootOrder: Object.keys(nodes),
  selectedIds: [],
  vectorEditingNodeIds: [],
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

describe('handleUpdateNode', () => {
  it('should patch an existing node', () => {
    // mock
    const state = buildState({ [node.id]: { ...node } });

    // before
    handleUpdateNode(state, { changes: { width: 300 }, id: node.id });

    // result
    expect((state.nodes[node.id] as TFrameNode).width).toBe(300);
  });

  it('should do nothing when the node does not exist', () => {
    // mock
    const state = buildState({});

    // before
    handleUpdateNode(state, { changes: { width: 300 }, id: 'missing' });

    // result
    expect(state.nodes).toEqual({});
  });

  it('should propagate a path-node resize/rotate to every text node bound to it', () => {
    // mock
    const pathNode = buildPathNode();
    const textNode = buildPathText();
    const state = buildState({ [pathNode.id]: pathNode, [textNode.id]: textNode });

    // before
    handleUpdateNode(state, { changes: { height: 300, rotation: 45, width: 300, x: 10, y: 20 }, id: pathNode.id });

    // result
    expect(state.nodes[textNode.id]).toMatchObject({ height: 300, rotation: 45, width: 300, x: 10, y: 20 });
  });

  it('should propagate a text-node resize/rotate back onto its source path node', () => {
    // mock
    const pathNode = buildPathNode();
    const textNode = buildPathText();
    const state = buildState({ [pathNode.id]: pathNode, [textNode.id]: textNode });

    // before
    handleUpdateNode(state, { changes: { height: 300, rotation: 45, width: 300, x: 10, y: 20 }, id: textNode.id });

    // result
    expect(state.nodes[pathNode.id]).toMatchObject({ height: 300, rotation: 45, width: 300, x: 10, y: 20 });
  });
});
