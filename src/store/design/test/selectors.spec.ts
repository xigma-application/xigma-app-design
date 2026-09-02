// selectors
import {
  selectActivePage,
  selectActivePageId,
  selectActiveTool,
  selectAllGuideLines,
  selectAreRulersVisible,
  selectCommentDraftPosition,
  selectComments,
  selectDescendantIdsOfSelected,
  selectEditingNodeId,
  selectEditingSelectionChangedAt,
  selectEditingSelectionEnd,
  selectEditingSelectionStart,
  selectEditingTextBox,
  selectEditingTextContent,
  selectFrameGuides,
  selectIsActionsPanelOpen,
  selectIsUiHidden,
  selectIsUiMinimized,
  selectLastFrameTool,
  selectLastMoreTool,
  selectLastMouseTool,
  selectLastPenTool,
  selectLastShapeTool,
  selectLastTextTool,
  selectMaskConnectorRoleById,
  selectNodes,
  selectOrderedNodes,
  selectPageGuides,
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
  guides: [{ axis: 'y', id: 'frame-guide', position: 5 }],
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
    areRulersVisible: true,
    commentDraftPosition: { x: 1, y: 2 },
    editingNodeId: 'node-2',
    editingSelectionChangedAt: 42,
    editingSelectionEnd: 8,
    editingSelectionStart: 3,
    editingTextBox: { flipX: false, flipY: false, height: 20, rotation: 0, width: 100, x: 10, y: 10 },
    editingTextContent: 'hello',
    isActionsPanelOpen: true,
    isUiHidden: false,
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
        guides: [{ axis: 'x', id: 'page-guide', position: 50 }],
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

  it('should select the rulers visibility flag', () => {
    // result
    expect(selectAreRulersVisible(state)).toBe(true);
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

  it('should select the Actions panel open flag', () => {
    // result
    expect(selectIsActionsPanelOpen(state)).toBe(true);
  });

  it('should select the minimized UI flag', () => {
    // result
    expect(selectIsUiMinimized(state)).toBe(true);
  });

  it('should select the hidden UI flag', () => {
    // result
    expect(selectIsUiHidden(state)).toBe(false);
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

  it('should select the active page guides', () => {
    // result
    expect(selectPageGuides(state)).toEqual([{ axis: 'x', id: 'page-guide', position: 50 }]);
  });

  it("should select world-space lines for every unrotated frame's own guides", () => {
    // result
    expect(selectFrameGuides(state)).toEqual([
      { axis: 'y', frameId: node.id, id: 'frame-guide', span: { from: 0, to: 10 }, worldPosition: 5 },
    ]);
  });

  it('should select the union of page and frame guides, normalised to world-space lines', () => {
    // result
    expect(selectAllGuideLines(state)).toEqual([
      { axis: 'x', frameId: null, id: 'page-guide', span: null, worldPosition: 50 },
      { axis: 'y', frameId: node.id, id: 'frame-guide', span: { from: 0, to: 10 }, worldPosition: 5 },
    ]);
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

  it('should mark the last isMask child as "mask" and its one earlier sibling as "masked-start"', () => {
    // mock
    const maskState = {
      design: {
        ...state.design,
        pages: {
          'page-1': {
            ...state.design.pages['page-1'],
            nodes: { a: childA, b: { ...childB, isMask: true }, 'group-1': group, loose },
            rootOrder: ['group-1', 'loose'],
            selectedIds: [],
          },
        },
      },
    } as any;

    // result
    const roles = selectMaskConnectorRoleById(maskState);
    expect(roles.get('b')).toEqual([{ depthOffset: 0, role: 'mask' }]);
    expect(roles.get('a')).toEqual([{ depthOffset: 0, role: 'masked-start' }]);
    expect(roles.has('loose')).toBe(false);
  });

  it('should mark the first of several masked siblings "masked-start" and the rest "masked-continue"', () => {
    // mock
    const c: TRectangleNode = { ...node, id: 'c', parentId: 'group-1', type: NodeType.rectangle };
    const threeChildGroup: TGroupNode = { ...group, childIds: ['a', 'c', 'b'] };
    const maskState = {
      design: {
        ...state.design,
        pages: {
          'page-1': {
            ...state.design.pages['page-1'],
            nodes: { a: childA, b: { ...childB, isMask: true }, c, 'group-1': threeChildGroup, loose },
            rootOrder: ['group-1', 'loose'],
            selectedIds: [],
          },
        },
      },
    } as any;

    // result — both are direct children of the same mask-group, so neither is inherited: depthOffset 0
    const roles = selectMaskConnectorRoleById(maskState);
    expect(roles.get('a')).toEqual([{ depthOffset: 0, role: 'masked-start' }]);
    expect(roles.get('c')).toEqual([{ depthOffset: 0, role: 'masked-continue' }]);
    expect(roles.get('b')).toEqual([{ depthOffset: 0, role: 'mask' }]);
  });

  it('should propagate "masked-continue" onto every descendant of a masked, expanded group — not just its direct children', () => {
    // mock — inner group "a" is masked; its own child "c" (and c's child "d") should inherit the role
    const c: TRectangleNode = { ...node, id: 'c', parentId: 'a', type: NodeType.rectangle };
    const d: TRectangleNode = { ...node, id: 'd', parentId: 'c-group', type: NodeType.rectangle };
    const cGroup: TGroupNode = { ...group, childIds: ['d'], id: 'c-group', parentId: 'a' };
    const innerGroup: TGroupNode = { ...group, childIds: ['c', 'c-group'], id: 'a' };
    const maskState = {
      design: {
        ...state.design,
        pages: {
          'page-1': {
            ...state.design.pages['page-1'],
            nodes: { a: innerGroup, b: { ...childB, isMask: true }, c, 'c-group': cGroup, d, 'group-1': group, loose },
            rootOrder: ['group-1', 'loose'],
            selectedIds: [],
          },
        },
      },
    } as any;

    // result — "a" is the direct masked sibling (masked-start, depthOffset 0); its own descendants
    // only ever continue, and depthOffset counts nesting levels below "a" so the connector line can
    // be pulled back into "a"'s own column instead of drifting right with each indent level
    const roles = selectMaskConnectorRoleById(maskState);
    expect(roles.get('a')).toEqual([{ depthOffset: 0, role: 'masked-start' }]);
    expect(roles.get('c')).toEqual([{ depthOffset: 1, role: 'masked-continue' }]);
    expect(roles.get('c-group')).toEqual([{ depthOffset: 1, role: 'masked-continue' }]);
    expect(roles.get('d')).toEqual([{ depthOffset: 2, role: 'masked-continue' }]);
  });

  it("should carry both its own scope role AND the outer chain's passthrough when a masked descendant is itself a masked member of a nested mask group", () => {
    // mock — "a" is masked content of the outer group-1/b chain; "a" also contains its own
    // nested mask scope (x masks y). "x" must show both: the outer passthrough (depthOffset 1,
    // continuing group-1's chain) AND its own inner scope role (depthOffset 0, masked-start)
    const x: TRectangleNode = { ...node, id: 'x', parentId: 'a', type: NodeType.rectangle };
    const y: TRectangleNode = { ...node, id: 'y', isMask: true, parentId: 'a', type: NodeType.rectangle };
    const innerMaskGroup: TGroupNode = { ...group, childIds: ['x', 'y'], id: 'a', parentId: 'group-1' };
    const maskState = {
      design: {
        ...state.design,
        pages: {
          'page-1': {
            ...state.design.pages['page-1'],
            nodes: { a: innerMaskGroup, b: { ...childB, isMask: true }, 'group-1': group, loose, x, y },
            rootOrder: ['group-1', 'loose'],
            selectedIds: [],
          },
        },
      },
    } as any;

    // result
    const roles = selectMaskConnectorRoleById(maskState);
    expect(roles.get('a')).toEqual([{ depthOffset: 0, role: 'masked-start' }]);
    expect(roles.get('x')).toEqual([
      { depthOffset: 0, role: 'masked-start' },
      { depthOffset: 1, role: 'masked-continue' },
    ]);
    expect(roles.get('y')).toEqual([
      { depthOffset: 0, role: 'mask' },
      { depthOffset: 1, role: 'masked-continue' },
    ]);
  });

  it('should not propagate any role onto descendants of the mask node itself', () => {
    // mock — "b" is the mask and is also a group; its child "e" must stay unmarked
    const e: TRectangleNode = { ...node, id: 'e', parentId: 'b', type: NodeType.rectangle };
    const maskGroupB: TGroupNode = { ...group, childIds: ['e'], id: 'b', isMask: true };
    const maskState = {
      design: {
        ...state.design,
        pages: {
          'page-1': {
            ...state.design.pages['page-1'],
            nodes: { a: childA, b: maskGroupB, e, 'group-1': group, loose },
            rootOrder: ['group-1', 'loose'],
            selectedIds: [],
          },
        },
      },
    } as any;

    // result
    const roles = selectMaskConnectorRoleById(maskState);
    expect(roles.get('b')).toEqual([{ depthOffset: 0, role: 'mask' }]);
    expect(roles.has('e')).toBe(false);
  });

  it('should leave no roles when the mask has nothing above it (childIds[0])', () => {
    // mock
    const topMaskState = {
      design: {
        ...state.design,
        pages: {
          'page-1': {
            ...state.design.pages['page-1'],
            nodes: { a: { ...childA, isMask: true }, b: childB, 'group-1': group, loose },
            rootOrder: ['group-1', 'loose'],
            selectedIds: [],
          },
        },
      },
    } as any;

    // result
    expect(selectMaskConnectorRoleById(topMaskState).size).toBe(0);
  });

  it('should leave no roles for a group with no mask child', () => {
    // result
    expect(selectMaskConnectorRoleById(groupState).size).toBe(0);
  });
});
