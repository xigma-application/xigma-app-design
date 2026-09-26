// types
import { LayoutMode, NodeType, ToolName } from 'types/design/enums';
import { TDesignPage, TDesignState } from '../../../../../types';
import { TFrameNode, TRectangleNode, TTextNode } from 'types/design/types';
import { TImagePaint } from 'types/design/paint/types';

// utils
import { applyAutoLayoutSyncChildPosition } from '../applyAutoLayoutSyncChildPosition';
import { getActivePage } from '../../../../getActivePage';

const rect = (overrides: Partial<TRectangleNode>): TRectangleNode => ({
  fills: [{ color: '#fff', opacity: 100, type: 'solid' }],
  height: 20,
  id: 'a',
  name: 'Rectangle',
  parentId: 'frame-1',
  rotation: 0,
  type: NodeType.rectangle,
  width: 20,
  x: 0,
  y: 0,
  ...overrides,
});

const text = (overrides: Partial<TTextNode>): TTextNode => ({
  content: 'Text',
  fill: '#000',
  flipX: false,
  flipY: false,
  fontFamily: 'Inter',
  fontSize: 16,
  height: 20,
  id: 'a',
  name: 'Text',
  parentId: 'frame-1',
  rotation: 0,
  type: NodeType.text,
  width: 20,
  x: 0,
  y: 0,
  ...overrides,
});

const frame = (overrides: Partial<TFrameNode>): TFrameNode => ({
  childIds: [],
  clipContent: true,
  fills: [{ color: '#fff', opacity: 100, type: 'solid' }],
  height: 100,
  id: 'frame-1',
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 100,
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
  gradientEditor: null,
  imageEditor: null,
  isActionsPanelOpen: false,
  isMediaToolArmed: false,
  isPatternSourcePicking: false,
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
  patternSourcePickTarget: null,
  penActiveVertexId: null,
  preferences: {
    areAdditionalLabelsVisible: true,
    areFrameOutlinesVisible: false,
    areLayoutGuidesVisible: true,
    areMaskOutlinesVisible: false,
    areRulersVisible: false,
    resolvedTheme: 'dark',
  },
  revealedMinMax: { maxHeight: false, maxWidth: false, minHeight: false, minWidth: false },
  vectorEditingNodeIds: [],
  vectorPointSelection: { handles: [], segmentIds: [], vertexIds: [] },
});

describe('applyAutoLayoutSyncChildPosition', () => {
  it('should resize the child when the target size differs and its rotation matches the frame', () => {
    // mock
    const a = rect({ width: 20 });
    const layoutFrame = frame({ childIds: ['a'] });
    const state = buildState({ nodes: { a, 'frame-1': layoutFrame } });

    // before
    applyAutoLayoutSyncChildPosition(
      state,
      getActivePage(state).nodes,
      layoutFrame,
      { x: 50, y: 50 },
      a,
      { height: 20, width: 20, x: 0, y: 0 },
      { height: 40, id: 'a', width: 60, x: 0, y: 0 },
    );

    // result
    expect(getActivePage(state).nodes.a).toMatchObject({ height: 40, width: 60 });
  });

  it('should scale a stored image crop proportionally when the child resizes, instead of clearing it', () => {
    // mock — a crop that exactly matches the child's own bounds before the resize
    const paint: TImagePaint = {
      crop: { height: 20, rotation: 0, width: 20, x: 0, y: 0 },
      opacity: 100,
      ref: 'image-1',
      rotation: 0,
      scaleMode: 'fill',
      type: 'image',
    };
    const a = rect({ fills: [paint], height: 20, width: 20 });
    const layoutFrame = frame({ childIds: ['a'] });
    const state = buildState({ nodes: { a, 'frame-1': layoutFrame } });

    // before
    applyAutoLayoutSyncChildPosition(
      state,
      getActivePage(state).nodes,
      layoutFrame,
      { x: 50, y: 50 },
      a,
      { height: 20, width: 20, x: 0, y: 0 },
      { height: 40, id: 'a', width: 60, x: 0, y: 0 },
    );

    // result — the crop grew along with the child, still filling its new bounds exactly
    const updated = getActivePage(state).nodes.a as TRectangleNode;

    expect(updated).toMatchObject({ height: 40, width: 60 });
    expect((updated.fills[0] as TImagePaint).crop).toEqual({ height: 40, rotation: 0, width: 60, x: 0, y: 0 });
  });

  it('should not resize the child when its rotation differs from the frame’s rotation', () => {
    // mock
    const a = rect({ rotation: 45, width: 20 });
    const layoutFrame = frame({ childIds: ['a'] });
    const state = buildState({ nodes: { a, 'frame-1': layoutFrame } });

    // before
    applyAutoLayoutSyncChildPosition(
      state,
      getActivePage(state).nodes,
      layoutFrame,
      { x: 50, y: 50 },
      a,
      { height: 20, width: 20, x: 0, y: 0 },
      { height: 40, id: 'a', width: 60, x: 0, y: 0 },
    );

    // result
    expect(getActivePage(state).nodes.a).toMatchObject({ height: 20, width: 20 });
  });

  it('should shift the child by the reposition delta between its current and target bound', () => {
    // mock
    const a = rect({ x: 5, y: 5 });
    const layoutFrame = frame({ childIds: ['a'] });
    const state = buildState({ nodes: { a, 'frame-1': layoutFrame } });

    // before
    applyAutoLayoutSyncChildPosition(
      state,
      getActivePage(state).nodes,
      layoutFrame,
      { x: 50, y: 50 },
      a,
      { height: 20, width: 20, x: 5, y: 5 },
      { height: 20, id: 'a', width: 20, x: 45, y: 5 },
    );

    // result — moved +40 on x, unchanged on y
    expect(getActivePage(state).nodes.a).toMatchObject({ x: 45, y: 5 });
  });

  it('should carry a stored image crop along by the same reposition delta, instead of clearing it', () => {
    // mock
    const paint: TImagePaint = {
      crop: { height: 5, rotation: 0, width: 5, x: 2, y: 3 },
      opacity: 100,
      ref: 'image-1',
      rotation: 0,
      scaleMode: 'fill',
      type: 'image',
    };
    const a = rect({ fills: [paint], x: 5, y: 5 });
    const layoutFrame = frame({ childIds: ['a'] });
    const state = buildState({ nodes: { a, 'frame-1': layoutFrame } });

    // before
    applyAutoLayoutSyncChildPosition(
      state,
      getActivePage(state).nodes,
      layoutFrame,
      { x: 50, y: 50 },
      a,
      { height: 20, width: 20, x: 5, y: 5 },
      { height: 20, id: 'a', width: 20, x: 45, y: 5 },
    );

    // result — moved +40 on x, unchanged on y; the crop rides along by the same delta
    const updated = getActivePage(state).nodes.a as TRectangleNode;

    expect(updated).toMatchObject({ x: 45, y: 5 });
    expect((updated.fills[0] as TImagePaint).crop).toEqual({ height: 5, rotation: 0, width: 5, x: 42, y: 3 });
  });

  it('should resize a non-appearance child without touching its fill', () => {
    // mock
    const a = text({ width: 20 });
    const layoutFrame = frame({ childIds: ['a'] });
    const state = buildState({ nodes: { a, 'frame-1': layoutFrame } });

    // before
    applyAutoLayoutSyncChildPosition(
      state,
      getActivePage(state).nodes,
      layoutFrame,
      { x: 50, y: 50 },
      a,
      { height: 20, width: 20, x: 0, y: 0 },
      { height: 40, id: 'a', width: 60, x: 0, y: 0 },
    );

    // result
    expect(getActivePage(state).nodes.a).toMatchObject({ fill: '#000', height: 40, width: 60 });
  });

  it('should default the crop scale factor to 1 when the child’s current width or height is zero', () => {
    // mock — a child with no current size yet, so oldCenter collapses onto its own x/y
    const paint: TImagePaint = {
      crop: { height: 20, rotation: 0, width: 20, x: 0, y: 0 },
      opacity: 100,
      ref: 'image-1',
      rotation: 0,
      scaleMode: 'fill',
      type: 'image',
    };
    const a = rect({ fills: [paint], height: 0, width: 0 });
    const layoutFrame = frame({ childIds: ['a'] });
    const state = buildState({ nodes: { a, 'frame-1': layoutFrame } });

    // before
    applyAutoLayoutSyncChildPosition(
      state,
      getActivePage(state).nodes,
      layoutFrame,
      { x: 50, y: 50 },
      a,
      { height: 0, width: 0, x: 0, y: 0 },
      { height: 40, id: 'a', width: 60, x: 0, y: 0 },
    );

    // result — the crop keeps its own size (scale factor defaults to 1) but re-centers on the child’s new bounds
    const updated = getActivePage(state).nodes.a as TRectangleNode;

    expect(updated).toMatchObject({ height: 40, width: 60 });
    expect((updated.fills[0] as TImagePaint).crop).toEqual({ height: 20, rotation: 0, width: 20, x: 30, y: 20 });
  });

  it('should shift a non-appearance child without touching its fills', () => {
    // mock
    const a = text({ x: 5, y: 5 });
    const layoutFrame = frame({ childIds: ['a'] });
    const state = buildState({ nodes: { a, 'frame-1': layoutFrame } });

    // before
    applyAutoLayoutSyncChildPosition(
      state,
      getActivePage(state).nodes,
      layoutFrame,
      { x: 50, y: 50 },
      a,
      { height: 20, width: 20, x: 5, y: 5 },
      { height: 20, id: 'a', width: 20, x: 45, y: 5 },
    );

    // result
    expect(getActivePage(state).nodes.a).toMatchObject({ fill: '#000', x: 45, y: 5 });
  });

  it('should recurse into a nested horizontal auto-layout frame child', () => {
    // mock
    const innerChild = rect({ id: 'innerChild', parentId: 'inner', x: 999, y: 999 });
    const inner = frame({ childIds: ['innerChild'], id: 'inner', layoutMode: LayoutMode.horizontal, x: 0, y: 0 });
    const outer = frame({ childIds: ['inner'] });
    const state = buildState({ nodes: { 'frame-1': outer, inner, innerChild } });

    // before
    applyAutoLayoutSyncChildPosition(
      state,
      getActivePage(state).nodes,
      outer,
      { x: 50, y: 50 },
      inner,
      { height: 20, width: 20, x: 0, y: 0 },
      { height: 20, id: 'inner', width: 20, x: 0, y: 0 },
    );

    // result — the nested frame's own child got repositioned by the recursive sync
    expect(getActivePage(state).nodes.innerChild).toMatchObject({ x: 0, y: 0 });
  });

  it('should recurse into a nested vertical auto-layout frame child', () => {
    // mock
    const innerChild = rect({ id: 'innerChild', parentId: 'inner', x: 999, y: 999 });
    const inner = frame({ childIds: ['innerChild'], id: 'inner', layoutMode: LayoutMode.vertical, x: 0, y: 0 });
    const outer = frame({ childIds: ['inner'] });
    const state = buildState({ nodes: { 'frame-1': outer, inner, innerChild } });

    // before
    applyAutoLayoutSyncChildPosition(
      state,
      getActivePage(state).nodes,
      outer,
      { x: 50, y: 50 },
      inner,
      { height: 20, width: 20, x: 0, y: 0 },
      { height: 20, id: 'inner', width: 20, x: 0, y: 0 },
    );

    // result — the nested frame's own child got repositioned by the recursive sync
    expect(getActivePage(state).nodes.innerChild).toMatchObject({ x: 0, y: 0 });
  });

  it('should recurse into a nested grid auto-layout frame child', () => {
    // mock
    const innerChild = rect({ id: 'innerChild', parentId: 'inner', x: 999, y: 999 });
    const inner = frame({ childIds: ['innerChild'], gridColumnCount: 1, id: 'inner', layoutMode: LayoutMode.grid, x: 0, y: 0 });
    const outer = frame({ childIds: ['inner'] });
    const state = buildState({ nodes: { 'frame-1': outer, inner, innerChild } });

    // before
    applyAutoLayoutSyncChildPosition(
      state,
      getActivePage(state).nodes,
      outer,
      { x: 50, y: 50 },
      inner,
      { height: 20, width: 20, x: 0, y: 0 },
      { height: 20, id: 'inner', width: 20, x: 0, y: 0 },
    );

    // result — the nested grid frame's own child got repositioned by the recursive sync
    expect(getActivePage(state).nodes.innerChild).toMatchObject({ x: 0, y: 0 });
  });

  it('should not recurse into a non-frame child', () => {
    // mock
    const a = rect({});
    const layoutFrame = frame({ childIds: ['a'] });
    const state = buildState({ nodes: { a, 'frame-1': layoutFrame } });

    // before / result
    expect(() =>
      applyAutoLayoutSyncChildPosition(
        state,
        getActivePage(state).nodes,
        layoutFrame,
        { x: 50, y: 50 },
        a,
        { height: 20, width: 20, x: 0, y: 0 },
        { height: 20, id: 'a', width: 20, x: 0, y: 0 },
      ),
    ).not.toThrow();
  });

  it('should not recurse into a frame child with no auto-layout mode', () => {
    // mock
    const innerChild = rect({ id: 'innerChild', parentId: 'inner', x: 5, y: 5 });
    const inner = frame({ childIds: ['innerChild'], id: 'inner', x: 0, y: 0 });
    const outer = frame({ childIds: ['inner'] });
    const state = buildState({ nodes: { 'frame-1': outer, inner, innerChild } });

    // before
    applyAutoLayoutSyncChildPosition(
      state,
      getActivePage(state).nodes,
      outer,
      { x: 50, y: 50 },
      inner,
      { height: 20, width: 20, x: 0, y: 0 },
      { height: 20, id: 'inner', width: 20, x: 0, y: 0 },
    );

    // result — no recursive sync ran, so the untouched child keeps its original position
    expect(getActivePage(state).nodes.innerChild).toMatchObject({ x: 5, y: 5 });
  });
});
