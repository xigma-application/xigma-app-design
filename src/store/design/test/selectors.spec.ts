// selectors
import {
  selectActivePage,
  selectActivePageId,
  selectActiveTool,
  selectCommentDraftPosition,
  selectComments,
  selectDescendantIdsOfSelected,
  selectEditingNodeId,
  selectEditingSelectionChangedAt,
  selectEditingSelectionEnd,
  selectEditingSelectionStart,
  selectEditingTextBox,
  selectEditingTextContent,
  selectIsUiMinimized,
  selectLastFrameTool,
  selectLastMoreTool,
  selectLastMouseTool,
  selectLastPenTool,
  selectLastShapeTool,
  selectLastTextTool,
  selectNodes,
  selectOrderedNodes,
  selectPages,
  selectPaintColor,
  selectPenActiveVertexId,
  selectRenderOrderedNodes,
  selectSelectedIds,
  selectSelectedLeafNodes,
  selectSelectedNodes,
  selectVectorEditingNodeIds,
  selectViewport,
} from '../selectors';

// types
import { NodeType, ToolName } from 'types/design/enums';
import { TGroupNode, TRectangleNode, TSceneNode } from 'types/design/types';

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

const comment = { author: 'Xigma', content: 'hello', id: 'comment-1', x: 3, y: 4 };

const state = {
  design: {
    activePageId: 'page-1',
    activeTool: ToolName.frame,
    commentDraftPosition: { x: 1, y: 2 },
    editingNodeId: 'node-2',
    editingSelectionChangedAt: 42,
    editingSelectionEnd: 8,
    editingSelectionStart: 3,
    editingTextBox: { flipX: false, flipY: false, height: 20, rotation: 0, width: 100, x: 10, y: 10 },
    editingTextContent: 'hello',
    isUiMinimized: true,
    lastFrameTool: ToolName.section,
    lastMoreTool: ToolName.shapeBuilder,
    lastMouseTool: ToolName.hand,
    lastPenTool: ToolName.pen,
    lastShapeTool: ToolName.ellipse,
    lastTextTool: ToolName.textOnPath,
    pages: {
      'page-1': {
        comments: { [comment.id]: comment },
        id: 'page-1',
        name: 'Page 1',
        nodes: { [node.id]: node },
        paintColor: '#d9d9d9',
        rootOrder: [node.id],
        selectedIds: [node.id],
        viewport: { x: 5, y: 10, zoom: 2 },
      },
    },
    penActiveVertexId: 'vertex-1',
    vectorEditingNodeIds: [node.id],
  },
} as any;

describe('design selectors', () => {
  it('should select the active page id', () => {
    // result
    expect(selectActivePageId(state)).toBe('page-1');
  });

  it('should select the pages record', () => {
    // result
    expect(selectPages(state)).toBe(state.design.pages);
  });

  it('should select the active page', () => {
    // result
    expect(selectActivePage(state)).toBe(state.design.pages['page-1']);
  });

  it('should select the active tool', () => {
    // result
    expect(selectActiveTool(state)).toBe(ToolName.frame);
  });

  it('should select the comment draft position', () => {
    // result
    expect(selectCommentDraftPosition(state)).toEqual({ x: 1, y: 2 });
  });

  it('should select the comments as an array', () => {
    // result
    expect(selectComments(state)).toEqual([comment]);
  });

  it('should return the same array reference for selectComments when called again on the same state', () => {
    // result
    expect(selectComments(state)).toBe(selectComments(state));
  });

  it('should select the editing node id', () => {
    // result
    expect(selectEditingNodeId(state)).toBe('node-2');
  });

  it('should select the editing selection changed-at timestamp', () => {
    // result
    expect(selectEditingSelectionChangedAt(state)).toBe(42);
  });

  it('should select the editing selection end', () => {
    // result
    expect(selectEditingSelectionEnd(state)).toBe(8);
  });

  it('should select the editing selection start', () => {
    // result
    expect(selectEditingSelectionStart(state)).toBe(3);
  });

  it('should select the editing text box', () => {
    // result
    expect(selectEditingTextBox(state)).toEqual({ flipX: false, flipY: false, height: 20, rotation: 0, width: 100, x: 10, y: 10 });
  });

  it('should select the editing text content', () => {
    // result
    expect(selectEditingTextContent(state)).toBe('hello');
  });

  it('should select the minimized UI flag', () => {
    // result
    expect(selectIsUiMinimized(state)).toBe(true);
  });

  it('should select the last shape tool', () => {
    // result
    expect(selectLastShapeTool(state)).toBe(ToolName.ellipse);
  });

  it('should select the last frame tool', () => {
    // result
    expect(selectLastFrameTool(state)).toBe(ToolName.section);
  });

  it('should select the last More tool', () => {
    // result
    expect(selectLastMoreTool(state)).toBe(ToolName.shapeBuilder);
  });

  it('should select the last mouse tool', () => {
    // result
    expect(selectLastMouseTool(state)).toBe(ToolName.hand);
  });

  it('should select the last pen tool', () => {
    // result
    expect(selectLastPenTool(state)).toBe(ToolName.pen);
  });

  it('should select the last text tool', () => {
    // result
    expect(selectLastTextTool(state)).toBe(ToolName.textOnPath);
  });

  it('should select the paint color', () => {
    // result
    expect(selectPaintColor(state)).toBe('#d9d9d9');
  });

  it('should select the pen active vertex id', () => {
    // result
    expect(selectPenActiveVertexId(state)).toBe('vertex-1');
  });

  it('should select the vector editing node ids', () => {
    // result
    expect(selectVectorEditingNodeIds(state)).toEqual([node.id]);
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

describe('design selectors — groups', () => {
  const childA: TRectangleNode = { ...node, id: 'a', parentId: 'group-1', type: NodeType.rectangle };
  const childB: TRectangleNode = { ...node, id: 'b', parentId: 'group-1', type: NodeType.rectangle };
  const group: TGroupNode = {
    childIds: ['a', 'b'],
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
  const loose: TRectangleNode = { ...node, id: 'loose', type: NodeType.rectangle };

  const groupState = {
    design: {
      ...state.design,
      pages: {
        'page-1': {
          ...state.design.pages['page-1'],
          nodes: { a: childA, b: childB, 'group-1': group, loose },
          rootOrder: ['group-1', 'loose'],
          selectedIds: ['group-1'],
        },
      },
    },
  } as any;

  it('should flatten group children into render order behind the group node', () => {
    // result
    expect(selectRenderOrderedNodes(groupState).map((sceneNode) => sceneNode.id)).toEqual(['group-1', 'a', 'b', 'loose']);
  });

  it('should expand a selected group to its leaf nodes', () => {
    // result
    expect(selectSelectedLeafNodes(groupState).map((sceneNode) => sceneNode.id)).toEqual(['a', 'b']);
  });

  it('should collect every descendant id of a selected group', () => {
    // result
    expect([...selectDescendantIdsOfSelected(groupState)]).toEqual(['a', 'b']);
  });

  it('should collect descendants across nested groups and ignore non-group selections', () => {
    // mock
    const innerGroup: TGroupNode = { ...group, childIds: ['a'], id: 'inner', parentId: 'group-1' };
    const nestedState = {
      design: {
        ...state.design,
        pages: {
          'page-1': {
            ...state.design.pages['page-1'],
            nodes: { a: { ...childA, parentId: 'inner' }, 'group-1': { ...group, childIds: ['inner'] }, inner: innerGroup, loose },
            rootOrder: ['group-1', 'loose'],
            selectedIds: ['group-1', 'loose'],
          },
        },
      },
    } as any;

    // result
    expect([...selectDescendantIdsOfSelected(nestedState)]).toEqual(['inner', 'a']);
  });

  it('should return an empty set when no group is selected', () => {
    // result
    expect(selectDescendantIdsOfSelected(state).size).toBe(0);
  });

  it('should skip root-order ids and child ids that no longer resolve', () => {
    // mock
    const danglingState = {
      design: {
        ...state.design,
        pages: {
          'page-1': {
            ...state.design.pages['page-1'],
            nodes: { a: childA, 'group-1': { ...group, childIds: ['a', 'gone'] }, loose },
            rootOrder: ['group-1', 'missing', 'loose'],
            selectedIds: [],
          },
        },
      },
    } as any;

    // result
    expect(selectRenderOrderedNodes(danglingState).map((sceneNode) => sceneNode.id)).toEqual(['group-1', 'a', 'loose']);
  });
});
