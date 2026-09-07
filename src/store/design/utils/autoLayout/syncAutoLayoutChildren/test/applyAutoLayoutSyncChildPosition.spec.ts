// types
import { LayoutMode, NodeType, ToolName } from 'types/design/enums';
import { TDesignPage, TDesignState } from '../../../../types';
import { TFrameNode, TRectangleNode } from 'types/design/types';

// utils
import { applyAutoLayoutSyncChildPosition } from '../applyAutoLayoutSyncChildPosition';
import { getActivePage } from '../../../getActivePage';

const rect = (overrides: Partial<TRectangleNode>): TRectangleNode => ({
  fill: '#fff',
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

const frame = (overrides: Partial<TFrameNode>): TFrameNode => ({
  childIds: [],
  clipContent: true,
  fill: '#fff',
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
      nodes: {},
      paint: { color: '#d9d9d9', opacity: 100, type: 'solid' },
      rootOrder: [],
      selectedIds: [],
      viewport: { x: 0, y: 0, zoom: 1 },
      ...page,
    },
  },
  penActiveVertexId: null,
  preferences: {
    areAdditionalLabelsVisible: true,
    areFrameOutlinesVisible: false,
    areMaskOutlinesVisible: false,
    areRulersVisible: false,
  },
  vectorEditingNodeIds: [],
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
