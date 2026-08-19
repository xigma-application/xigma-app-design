// types
import { NodeType, PathType, ToolName } from 'types/design/enums';
import { TDesignState } from '../../types';
import { TPathNode, TTextNode } from 'types/design/types';

// utils
import { syncPathNodeFromText } from '../syncPathNodeFromText';

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
  rootOrder: Object.keys(nodes),
  selectedIds: [],
  viewport: { x: 0, y: 0, zoom: 1 },
});

describe('syncPathNodeFromText', () => {
  it("should copy the resized/rotated text node's box onto its source path node", () => {
    // mock
    const pathNode = buildPathNode();
    const textNode = buildPathText({ height: 300, rotation: 45, width: 300, x: 10, y: 20 });
    const state = buildState({ [pathNode.id]: pathNode, [textNode.id]: textNode });

    // before
    syncPathNodeFromText(state, textNode);

    // result
    expect(state.nodes[pathNode.id]).toMatchObject({ height: 300, rotation: 45, width: 300, x: 10, y: 20 });
  });

  it('should propagate the change to sibling text nodes bound to the same path', () => {
    // mock
    const pathNode = buildPathNode();
    const resized = buildPathText({ height: 300, id: 'text-1', width: 300, x: 10, y: 20 });
    const sibling = buildPathText({ id: 'text-2' });
    const state = buildState({ [pathNode.id]: pathNode, [resized.id]: resized, [sibling.id]: sibling });

    // before
    syncPathNodeFromText(state, resized);

    // result
    expect(state.nodes[sibling.id]).toMatchObject({ height: 300, width: 300, x: 10, y: 20 });
  });

  it('should do nothing when the text node has no path binding', () => {
    // mock
    const pathNode = buildPathNode();
    const textNode = buildPathText({ height: 300, pathId: null, width: 300 });
    const state = buildState({ [pathNode.id]: pathNode, [textNode.id]: textNode });

    // before
    syncPathNodeFromText(state, textNode);

    // result
    expect(state.nodes[pathNode.id]).toMatchObject({ height: 200, width: 200 });
  });

  it('should do nothing when the referenced node is not a path node', () => {
    // mock
    const textNode = buildPathText({ height: 300, pathId: 'missing', width: 300 });
    const state = buildState({ [textNode.id]: textNode });

    // before
    syncPathNodeFromText(state, textNode);

    // result
    expect(state.nodes).toEqual({ [textNode.id]: textNode });
  });
});
