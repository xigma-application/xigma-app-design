// types
import { LayoutMode, NodeType, ToolName } from 'types/design/enums';
import { TDesignPage, TDesignState } from '../../../types';
import { TFrameNode, TRectangleNode } from 'types/design/types';

// utils
import { getActivePage } from '../../getActivePage';
import { syncAutoLayoutChildren } from '../syncAutoLayoutChildren';

const rect = (overrides: Partial<TRectangleNode>): TRectangleNode => ({
  fill: '#fff',
  height: 20,
  id: 'r',
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
      nodes: {},
      paint: { color: '#d9d9d9', opacity: 100, type: 'solid' },
      rootOrder: [],
      selectedIds: [],
      viewport: { x: 0, y: 0, zoom: 1 },
      ...page,
    },
  },
  penActiveVertexId: null,
  vectorEditingNodeIds: [],
});

describe('syncAutoLayoutChildren', () => {
  it('should reposition children left to right when the frame flows horizontally', () => {
    // mock
    const a = rect({ id: 'a', width: 30, x: 999, y: 999 });
    const b = rect({ id: 'b', width: 50, x: 999, y: 999 });
    const layoutFrame = frame({ childIds: ['a', 'b'], itemSpacing: 10, layoutMode: LayoutMode.horizontal, x: 100, y: 200 });
    const state = buildState({ nodes: { a, b, 'frame-1': layoutFrame } });

    // action
    syncAutoLayoutChildren(state, 'frame-1');

    // result
    expect(getActivePage(state).nodes.a).toMatchObject({ x: 100, y: 200 });
    expect(getActivePage(state).nodes.b).toMatchObject({ x: 140, y: 200 });
  });

  it('should reposition children top to bottom when the frame flows vertically', () => {
    // mock
    const a = rect({ height: 30, id: 'a', x: 999, y: 999 });
    const b = rect({ height: 50, id: 'b', x: 999, y: 999 });
    const layoutFrame = frame({ childIds: ['a', 'b'], itemSpacing: 10, layoutMode: LayoutMode.vertical, x: 100, y: 200 });
    const state = buildState({ nodes: { a, b, 'frame-1': layoutFrame } });

    // action
    syncAutoLayoutChildren(state, 'frame-1');

    // result
    expect(getActivePage(state).nodes.a).toMatchObject({ x: 100, y: 200 });
    expect(getActivePage(state).nodes.b).toMatchObject({ x: 100, y: 240 });
  });

  it('should default a missing itemSpacing to zero', () => {
    // mock
    const a = rect({ id: 'a', width: 30 });
    const b = rect({ id: 'b', width: 50 });
    const layoutFrame = frame({ childIds: ['a', 'b'], layoutMode: LayoutMode.horizontal, x: 0, y: 0 });
    const state = buildState({ nodes: { a, b, 'frame-1': layoutFrame } });

    // action
    syncAutoLayoutChildren(state, 'frame-1');

    // result
    expect(getActivePage(state).nodes.b).toMatchObject({ x: 30, y: 0 });
  });

  it('should no-op for a null id', () => {
    // mock
    const state = buildState({ nodes: {} });

    // action / result
    expect(() => syncAutoLayoutChildren(state, null)).not.toThrow();
  });

  it('should no-op when the id does not resolve to a frame', () => {
    // mock
    const a = rect({ id: 'a', parentId: null });
    const state = buildState({ nodes: { a } });

    // action
    syncAutoLayoutChildren(state, 'a');

    // result
    expect(getActivePage(state).nodes.a).toMatchObject({ x: 0, y: 0 });
  });

  it('should no-op when the frame has no layout mode', () => {
    // mock
    const a = rect({ id: 'a', x: 5, y: 5 });
    const layoutFrame = frame({ childIds: ['a'] });
    const state = buildState({ nodes: { a, 'frame-1': layoutFrame } });

    // action
    syncAutoLayoutChildren(state, 'frame-1');

    // result
    expect(getActivePage(state).nodes.a).toMatchObject({ x: 5, y: 5 });
  });

  it('should no-op when the layout mode is freeForm', () => {
    // mock
    const a = rect({ id: 'a', x: 5, y: 5 });
    const layoutFrame = frame({ childIds: ['a'], layoutMode: LayoutMode.freeForm });
    const state = buildState({ nodes: { a, 'frame-1': layoutFrame } });

    // action
    syncAutoLayoutChildren(state, 'frame-1');

    // result
    expect(getActivePage(state).nodes.a).toMatchObject({ x: 5, y: 5 });
  });

  it('should skip a child id that no longer resolves to a node', () => {
    // mock
    const layoutFrame = frame({ childIds: ['gone'], layoutMode: LayoutMode.horizontal });
    const state = buildState({ nodes: { 'frame-1': layoutFrame } });

    // action / result
    expect(() => syncAutoLayoutChildren(state, 'frame-1')).not.toThrow();
  });
});
