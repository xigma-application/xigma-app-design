// others
import { EMPTY_SELECTED_INDICES, PAGE_BACKGROUND_PAINT } from '../constants';

// selectors
import {
  selectActivePage,
  selectActivePageId,
  selectActivePageName,
  selectActiveTool,
  selectAllGuideLines,
  selectAppearanceNodes,
  selectAreAdditionalLabelsVisible,
  selectAreFrameOutlinesVisible,
  selectAreLayoutGuidesVisible,
  selectAreMaskOutlinesVisible,
  selectAreRulersVisible,
  selectBackgroundPaint,
  selectCanConvertToFrame,
  selectCanConvertToSection,
  selectCanResizeToFit,
  selectCanSelectMatchingLayers,
  selectCanWrapInSection,
  selectCommentDraftPosition,
  selectComments,
  selectDescendantIdsOfSelected,
  selectDesignHintLabelKey,
  selectEditingAutoLayoutPadding,
  selectEditingNodeId,
  selectEditingSelectionChangedAt,
  selectEditingSelectionEnd,
  selectEditingSelectionStart,
  selectEditingTextBox,
  selectEditingTextContent,
  selectFrameGuides,
  selectGradientEditor,
  selectGridSectionHighlight,
  selectGridTrackModeMenuRequest,
  selectGridTrackSelection,
  selectGridTrackValueEditRequest,
  selectHoveredDimensionField,
  selectImageEditor,
  selectImageFillPickerFocus,
  selectIsActionsPanelOpen,
  selectIsExporting,
  selectIsGridSettingsPanelOpen,
  selectIsMediaToolArmed,
  selectIsPatternSourcePicking,
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
  selectOffsetVector,
  selectOpenPropertyPanel,
  selectOrderedNodes,
  selectPageGuides,
  selectPages,
  selectPaint,
  selectPaintFill,
  selectPaintStack,
  selectPanelGridTrackSelection,
  selectPatternSourcePickTarget,
  selectPenActiveVertexId,
  selectRenderOrderedNodes,
  selectResolvedTheme,
  selectRevealedMinMax,
  selectSelectedFillIndices,
  selectSelectedIds,
  selectSelectedLeafNodes,
  selectSelectedNodes,
  selectSelectedParentIds,
  selectSelectedParentNode,
  selectSelectedStrokeIndices,
  selectSmartSelectionNodes,
  selectTopLevelFrameNodes,
  selectVectorEditingNodeIds,
  selectVectorPointSelection,
  selectViewport,
  selectZoom,
} from '../selectors';

// types
import { NodeType, StrokeJoin, ToolName } from 'types/design/enums';
import { TGroupNode, TMaskNode, TRectangleNode, TSceneNode } from 'types/design/types';

const node: TSceneNode = {
  childIds: [],
  clipContent: true,
  fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
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
    commentDraftPosition: { x: 1, y: 2 },
    designHintLabelKey: null,
    editingNodeId: 'node-2',
    editingSelectionChangedAt: 42,
    editingSelectionEnd: 8,
    editingSelectionStart: 3,
    editingTextBox: { flipX: false, flipY: false, height: 20, rotation: 0, width: 100, x: 10, y: 10 },
    editingTextContent: 'hello',
    imageEditor: null,
    isActionsPanelOpen: true,
    isMediaToolArmed: false,
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
        backgroundPaint: { color: '#336699', opacity: 50, type: 'solid' },
        comments: { [comment.id]: comment },
        guides: [{ axis: 'x', id: 'page-guide', position: 50 }],
        id: 'page-1',
        name: 'Page 1',
        nodes: { [node.id]: node },
        paint: { color: '#d9d9d9', opacity: 100, type: 'solid' },
        rootOrder: [node.id],
        selectedIds: [node.id],
        viewport: { x: 5, y: 10, zoom: 2 },
      },
    },
    penActiveVertexId: 'vertex-1',
    preferences: {
      areAdditionalLabelsVisible: false,
      areFrameOutlinesVisible: true,
      areMaskOutlinesVisible: true,
      areRulersVisible: true,
    },
    vectorEditingNodeIds: [node.id],
    vectorPointSelection: { handles: [], segmentIds: [], vertexIds: ['point'] },
  },
} as any;

describe('design selectors', () => {
  it('should select the offset mode, or none when it was never started', () => {
    // mock
    const offsetVector = { distance: 20, join: StrokeJoin.round, nodeId: 'line' };

    // result
    expect(selectOffsetVector(state)).toBeNull();
    expect(selectOffsetVector({ ...state, design: { ...state.design, offsetVector } })).toBe(offsetVector);
  });

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

  it('should select the additional labels visibility flag', () => {
    // result
    expect(selectAreAdditionalLabelsVisible(state)).toBe(false);
  });

  it('should select the rulers visibility flag', () => {
    // result
    expect(selectAreRulersVisible(state)).toBe(true);
  });

  it('should select the frame outlines visibility flag', () => {
    // result
    expect(selectAreFrameOutlinesVisible(state)).toBe(true);
  });

  it('should select the mask outlines visibility flag', () => {
    // result
    expect(selectAreMaskOutlinesVisible(state)).toBe(true);
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

  it('should default the editing auto-layout padding state to null', () => {
    // result
    expect(selectEditingAutoLayoutPadding(state)).toBeNull();
  });

  it('should select the editing auto-layout padding state', () => {
    // mock
    const editing = { frameId: 'frame-1', point: { x: 10, y: 20 }, side: 'left' as const };
    const editingState = { ...state, design: { ...state.design, editingAutoLayoutPadding: editing } };

    // result
    expect(selectEditingAutoLayoutPadding(editingState)).toEqual(editing);
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

  it('should select the Grid settings panel open flag, defaulting to false when unset', () => {
    // result
    expect(selectIsGridSettingsPanelOpen(state)).toBe(false);
    expect(selectIsGridSettingsPanelOpen({ ...state, design: { ...state.design, isGridSettingsPanelOpen: true } } as typeof state)).toBe(
      true,
    );
  });

  it('should select the grid section highlight, defaulting to null when unset', () => {
    // result
    expect(selectGridSectionHighlight(state)).toBeNull();

    const highlight = { cells: [{ column: 0, row: 1 }], frameId: 'frame-1' };

    expect(selectGridSectionHighlight({ ...state, design: { ...state.design, gridSectionHighlight: highlight } } as typeof state)).toEqual(
      highlight,
    );
  });

  it('should select the image editor state, defaulting to null when unset', () => {
    // result
    expect(selectImageEditor(state)).toBeNull();

    const editor = { mode: 'position' as const, nodeId: 'node-1', paintIndex: 0 };

    expect(selectImageEditor({ ...state, design: { ...state.design, imageEditor: editor } } as typeof state)).toEqual(editor);
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

  it('should select the paint', () => {
    // result
    expect(selectPaint(state)).toEqual({ color: '#d9d9d9', opacity: 100, type: 'solid' });
  });

  it('should paint with the plain paint while there is no image fill Paint mode', () => {
    // result
    expect(selectPaintFill(state)).toBeNull();
    expect(selectPaintStack(state)).toEqual([{ color: '#d9d9d9', opacity: 100, type: 'solid' }]);
  });

  it('should select the background paint, independent of the vector paint tool paint', () => {
    // result
    expect(selectBackgroundPaint(state)).toEqual({ color: '#336699', opacity: 50, type: 'solid' });
  });

  it('should fall back to the theme default background when the page has none of its own', () => {
    // mock
    const pageId = state.design.activePageId;
    const withTheme = (resolvedTheme: 'dark' | 'light'): typeof state =>
      ({
        ...state,
        design: {
          ...state.design,
          pages: { ...state.design.pages, [pageId]: { ...state.design.pages[pageId], backgroundPaint: null } },
          preferences: { ...state.design.preferences, resolvedTheme },
        },
      }) as typeof state;

    // result
    expect(selectBackgroundPaint(withTheme('dark'))).toEqual(PAGE_BACKGROUND_PAINT.dark);
    expect(selectBackgroundPaint(withTheme('light'))).toEqual(PAGE_BACKGROUND_PAINT.light);
    expect(selectResolvedTheme(withTheme('light'))).toBe('light');
  });

  it('should select the pen active vertex id', () => {
    // result
    expect(selectPenActiveVertexId(state)).toBe('vertex-1');
  });

  it('should select the vector editing node ids', () => {
    // result
    expect(selectVectorEditingNodeIds(state)).toEqual([node.id]);
  });

  it('should select the selected points of the vector in edit mode', () => {
    // result
    expect(selectVectorPointSelection(state)).toEqual({ handles: [], segmentIds: [], vertexIds: ['point'] });
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

  it("should select the selected nodes' parent ids", () => {
    // result
    expect(selectSelectedParentIds(state)).toEqual([node.parentId]);
  });

  it('should return the same array reference for selectSelectedParentIds when called again on the same state', () => {
    // result
    expect(selectSelectedParentIds(state)).toBe(selectSelectedParentIds(state));
  });

  it('should select the top-level frame nodes', () => {
    // result
    expect(selectTopLevelFrameNodes(state)).toEqual([node]);
  });

  it('should filter out non-frame top-level nodes when selecting the top-level frame nodes', () => {
    // mock
    const rectangle: TRectangleNode = { ...node, id: 'rectangle-1', type: NodeType.rectangle };
    const stateWithRectangle = {
      design: {
        ...state.design,
        pages: {
          'page-1': {
            ...state.design.pages['page-1'],
            nodes: { ...state.design.pages['page-1'].nodes, [rectangle.id]: rectangle },
            rootOrder: [node.id, rectangle.id],
          },
        },
      },
    } as any;

    // result
    expect(selectTopLevelFrameNodes(stateWithRectangle)).toEqual([node]);
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

  it('should mark the last (mask) child as "mask" and its one earlier sibling as "masked-start"', () => {
    // mock — the last child of a mask container is always the mask, purely by position
    const maskGroup: TMaskNode = { ...group, type: NodeType.mask };
    const maskState = {
      design: {
        ...state.design,
        pages: {
          'page-1': {
            ...state.design.pages['page-1'],
            nodes: { a: childA, b: childB, 'group-1': maskGroup, loose },
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
    const threeChildGroup: TMaskNode = { ...group, childIds: ['a', 'c', 'b'], type: NodeType.mask };
    const maskState = {
      design: {
        ...state.design,
        pages: {
          'page-1': {
            ...state.design.pages['page-1'],
            nodes: { a: childA, b: childB, c, 'group-1': threeChildGroup, loose },
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
    const maskGroup: TMaskNode = { ...group, type: NodeType.mask };
    const maskState = {
      design: {
        ...state.design,
        pages: {
          'page-1': {
            ...state.design.pages['page-1'],
            nodes: { a: innerGroup, b: childB, c, 'c-group': cGroup, d, 'group-1': maskGroup, loose },
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
    const y: TRectangleNode = { ...node, id: 'y', parentId: 'a', type: NodeType.rectangle };
    const innerMaskGroup: TMaskNode = { ...group, childIds: ['x', 'y'], id: 'a', parentId: 'group-1', type: NodeType.mask };
    const maskGroup: TMaskNode = { ...group, type: NodeType.mask };
    const maskState = {
      design: {
        ...state.design,
        pages: {
          'page-1': {
            ...state.design.pages['page-1'],
            nodes: { a: innerMaskGroup, b: childB, 'group-1': maskGroup, loose, x, y },
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
    const groupB: TGroupNode = { ...group, childIds: ['e'], id: 'b' };
    const maskGroup: TMaskNode = { ...group, type: NodeType.mask };
    const maskState = {
      design: {
        ...state.design,
        pages: {
          'page-1': {
            ...state.design.pages['page-1'],
            nodes: { a: childA, b: groupB, e, 'group-1': maskGroup, loose },
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

  it('should leave no roles when the mask container has only one child (nothing above it)', () => {
    // mock
    const singleChildMaskGroup: TMaskNode = { ...group, childIds: ['a'], type: NodeType.mask };
    const topMaskState = {
      design: {
        ...state.design,
        pages: {
          'page-1': {
            ...state.design.pages['page-1'],
            nodes: { a: childA, b: childB, 'group-1': singleChildMaskGroup, loose },
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

describe('design selectors — panel and editor state', () => {
  const gridTrackSelection = { axis: 'column', frameId: 'node-1', indices: [0] };
  const filledState = {
    design: {
      ...state.design,
      designHintLabelKey: 'hint',
      gradientEditor: { nodeId: 'node-1' },
      gridTrackModeMenuRequest: { frameId: 'node-1' },
      gridTrackSelection,
      gridTrackValueEditRequest: { frameId: 'node-1' },
      hoveredDimensionField: 'width',
      imageFillPickerFocus: { index: 0 },
      isExporting: true,
      isMediaToolArmed: true,
      isPatternSourcePicking: true,
      openPropertyPanel: { index: 0, type: 'fill' },
      pages: {
        'page-1': { ...state.design.pages['page-1'], selectedFillIndices: [1], selectedStrokeIndices: [2] },
      },
      panelGridTrackSelection: gridTrackSelection,
      patternSourcePickTarget: { index: 0 },
      preferences: { ...state.design.preferences, areLayoutGuidesVisible: true },
      revealedMinMax: { maxHeight: true },
    },
  } as any;

  it('should select the active page name', () => {
    // result
    expect(selectActivePageName(state)).toBe('Page 1');
  });

  it('should select the values stored in the design state', () => {
    // result
    expect(selectAreLayoutGuidesVisible(filledState)).toBe(true);
    expect(selectDesignHintLabelKey(filledState)).toBe('hint');
    expect(selectGradientEditor(filledState)).toEqual({ nodeId: 'node-1' });
    expect(selectGridTrackModeMenuRequest(filledState)).toEqual({ frameId: 'node-1' });
    expect(selectGridTrackSelection(filledState)).toBe(gridTrackSelection);
    expect(selectGridTrackValueEditRequest(filledState)).toEqual({ frameId: 'node-1' });
    expect(selectHoveredDimensionField(filledState)).toBe('width');
    expect(selectImageFillPickerFocus(filledState)).toEqual({ index: 0 });
    expect(selectIsExporting(filledState)).toBe(true);
    expect(selectIsMediaToolArmed(filledState)).toBe(true);
    expect(selectIsPatternSourcePicking(filledState)).toBe(true);
    expect(selectOpenPropertyPanel(filledState)).toEqual({ index: 0, type: 'fill' });
    expect(selectPanelGridTrackSelection(filledState)).toBe(gridTrackSelection);
    expect(selectPatternSourcePickTarget(filledState)).toEqual({ index: 0 });
    expect(selectRevealedMinMax(filledState)).toEqual({ maxHeight: true });
    expect(selectSelectedFillIndices(filledState)).toEqual([1]);
    expect(selectSelectedStrokeIndices(filledState)).toEqual([2]);
  });

  it('should fall back to null, false or the empty indices when the state has no value', () => {
    // result
    expect(selectGridTrackModeMenuRequest(state)).toBeNull();
    expect(selectGridTrackSelection(state)).toBeNull();
    expect(selectGridTrackValueEditRequest(state)).toBeNull();
    expect(selectHoveredDimensionField(state)).toBeNull();
    expect(selectImageFillPickerFocus(state)).toBeNull();
    expect(selectIsExporting(state)).toBe(false);
    expect(selectOpenPropertyPanel(state)).toBeNull();
    expect(selectPanelGridTrackSelection(state)).toBeNull();
    expect(selectSelectedFillIndices(state)).toBe(EMPTY_SELECTED_INDICES);
    expect(selectSelectedStrokeIndices(state)).toBe(EMPTY_SELECTED_INDICES);
  });

  it('should select the zoom of the active page viewport', () => {
    // result
    expect(selectZoom(state)).toBe(2);
  });

  it('should derive the selection based helpers from the selected frame', () => {
    // result
    expect(selectAppearanceNodes(state)).toEqual([node]);
    expect(selectSmartSelectionNodes(state)).toEqual([node]);
    expect(selectSelectedParentNode(state)).toBeUndefined();
    expect(selectCanConvertToFrame(state)).toBe(false);
    expect(selectCanConvertToSection(state)).toBe(true);
    expect(selectCanResizeToFit(state)).toBe(false);
    expect(selectCanWrapInSection(state)).toBe(true);
    expect(selectCanSelectMatchingLayers(state)).toBe(false);
  });
});
