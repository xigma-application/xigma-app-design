// selectors
import {
  selectActiveTool,
  selectEditingNodeId,
  selectEditingTextBox,
  selectEditingTextContent,
  selectLastMouseTool,
  selectLastShapeTool,
  selectLastTextTool,
  selectNodes,
  selectOrderedNodes,
  selectSelectedIds,
  selectSelectedNodes,
  selectViewport,
} from '../selectors';

// types
import { NodeType, ToolName } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

const node: TSceneNode = {
  fill: '#ff0000',
  height: 10,
  id: 'node-1',
  name: 'Frame 1',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 10,
  x: 0,
  y: 0,
};

const state = {
  design: {
    activeTool: ToolName.frame,
    editingNodeId: 'node-2',
    editingTextBox: { flipX: false, flipY: false, height: 20, rotation: 0, width: 100, x: 10, y: 10 },
    editingTextContent: 'hello',
    lastMouseTool: ToolName.hand,
    lastShapeTool: ToolName.ellipse,
    lastTextTool: ToolName.textOnPath,
    nodes: { [node.id]: node },
    rootOrder: [node.id],
    selectedIds: [node.id],
    viewport: { x: 5, y: 10, zoom: 2 },
  },
} as any;

describe('design selectors', () => {
  it('should select the active tool', () => {
    // result
    expect(selectActiveTool(state)).toBe(ToolName.frame);
  });

  it('should select the editing node id', () => {
    // result
    expect(selectEditingNodeId(state)).toBe('node-2');
  });

  it('should select the editing text box', () => {
    // result
    expect(selectEditingTextBox(state)).toEqual({ flipX: false, flipY: false, height: 20, rotation: 0, width: 100, x: 10, y: 10 });
  });

  it('should select the editing text content', () => {
    // result
    expect(selectEditingTextContent(state)).toBe('hello');
  });

  it('should select the last shape tool', () => {
    // result
    expect(selectLastShapeTool(state)).toBe(ToolName.ellipse);
  });

  it('should select the last mouse tool', () => {
    // result
    expect(selectLastMouseTool(state)).toBe(ToolName.hand);
  });

  it('should select the last text tool', () => {
    // result
    expect(selectLastTextTool(state)).toBe(ToolName.textOnPath);
  });

  it('should select the nodes record', () => {
    // result
    expect(selectNodes(state)).toEqual({ [node.id]: node });
  });

  it('should select the nodes in root order', () => {
    // result
    expect(selectOrderedNodes(state)).toEqual([node]);
  });

  it('should return the same array reference for selectOrderedNodes when called again on the same state', () => {
    // result
    expect(selectOrderedNodes(state)).toBe(selectOrderedNodes(state));
  });

  it('should return the same array reference for selectSelectedNodes when called again on the same state', () => {
    // result
    expect(selectSelectedNodes(state)).toBe(selectSelectedNodes(state));
  });

  it('should select the viewport', () => {
    // result
    expect(selectViewport(state)).toEqual({ x: 5, y: 10, zoom: 2 });
  });

  it('should select the selected ids', () => {
    // result
    expect(selectSelectedIds(state)).toEqual([node.id]);
  });

  it('should select the selected nodes', () => {
    // result
    expect(selectSelectedNodes(state)).toEqual([node]);
  });
});
