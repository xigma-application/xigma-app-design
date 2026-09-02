// types
import { ToolName } from 'types/design/enums';
import { TDesignState } from '../../types';

// utils
import { handleSetActiveTool } from '../handleSetActiveTool';

const buildState = (overrides: Partial<TDesignState> = {}): TDesignState => ({
  activePageId: 'page-1',
  activeTool: ToolName.default,
  areRulersVisible: false,
  commentDraftPosition: null,
  editingNodeId: null,
  editingSelectionChangedAt: 0,
  editingSelectionEnd: 0,
  editingSelectionStart: 0,
  editingTextBox: null,
  editingTextContent: '',
  isActionsPanelOpen: false,
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
      comments: {},
      guides: [],
      id: 'page-1',
      name: 'Page 1',
      nodes: {},
      paint: { color: '#d9d9d9', opacity: 100, type: 'solid' },
      rootOrder: [],
      selectedIds: [],
      viewport: { x: 0, y: 0, zoom: 1 },
    },
  },
  penActiveVertexId: null,
  vectorEditingNodeIds: [],
  ...overrides,
});

describe('handleSetActiveTool', () => {
  it('should set the active tool', () => {
    // mock
    const state = buildState();

    // before
    handleSetActiveTool(state, ToolName.frame);

    // result
    expect(state.activeTool).toBe(ToolName.frame);
  });

  it('should remember the last shape tool when switching to the arrow tool', () => {
    // mock
    const state = buildState();

    // before
    handleSetActiveTool(state, ToolName.arrow);

    // result
    expect(state.lastShapeTool).toBe(ToolName.arrow);
  });

  it('should remember the last shape tool when switching to a shape tool', () => {
    // mock
    const state = buildState();

    // before
    handleSetActiveTool(state, ToolName.ellipse);

    // result
    expect(state.lastShapeTool).toBe(ToolName.ellipse);
  });

  it('should remember the last shape tool when switching to the star tool', () => {
    // mock
    const state = buildState();

    // before
    handleSetActiveTool(state, ToolName.star);

    // result
    expect(state.lastShapeTool).toBe(ToolName.star);
  });

  it('should remember the last shape tool when switching to the media tool', () => {
    // mock
    const state = buildState();

    // before
    handleSetActiveTool(state, ToolName.media);

    // result
    expect(state.lastShapeTool).toBe(ToolName.media);
  });

  it('should remember the last shape tool when switching to the line tool', () => {
    // mock
    const state = buildState();

    // before
    handleSetActiveTool(state, ToolName.line);

    // result
    expect(state.lastShapeTool).toBe(ToolName.line);
  });

  it('should remember the last shape tool when switching to the rectangle tool', () => {
    // mock
    const state = buildState();

    // before
    handleSetActiveTool(state, ToolName.rectangle);

    // result
    expect(state.lastShapeTool).toBe(ToolName.rectangle);
  });

  it('should remember the last shape tool when switching to the polygon tool', () => {
    // mock
    const state = buildState();

    // before
    handleSetActiveTool(state, ToolName.polygon);

    // result
    expect(state.lastShapeTool).toBe(ToolName.polygon);
  });

  it('should keep the last shape tool when switching to a non-shape tool', () => {
    // mock
    const state = buildState({ lastShapeTool: ToolName.ellipse });

    // before
    handleSetActiveTool(state, ToolName.comment);

    // result
    expect(state.lastShapeTool).toBe(ToolName.ellipse);
  });

  it('should remember the last frame tool when switching to the frame tool', () => {
    // mock
    const state = buildState();

    // before
    handleSetActiveTool(state, ToolName.frame);

    // result
    expect(state.lastFrameTool).toBe(ToolName.frame);
  });

  it('should remember the last frame tool when switching to the slice tool', () => {
    // mock
    const state = buildState();

    // before
    handleSetActiveTool(state, ToolName.slice);

    // result
    expect(state.lastFrameTool).toBe(ToolName.slice);
  });

  it('should remember the last frame tool when switching to the section tool', () => {
    // mock
    const state = buildState();

    // before
    handleSetActiveTool(state, ToolName.section);

    // result
    expect(state.lastFrameTool).toBe(ToolName.section);
  });

  it('should keep the last frame tool when switching to a non-frame-group tool', () => {
    // mock
    const state = buildState({ lastFrameTool: ToolName.section });

    // before
    handleSetActiveTool(state, ToolName.comment);

    // result
    expect(state.lastFrameTool).toBe(ToolName.section);
  });

  it('should remember the last mouse tool when switching to the hand tool', () => {
    // mock
    const state = buildState();

    // before
    handleSetActiveTool(state, ToolName.hand);

    // result
    expect(state.lastMouseTool).toBe(ToolName.hand);
  });

  it('should remember the last mouse tool when switching to the default tool', () => {
    // mock
    const state = buildState();

    // before
    handleSetActiveTool(state, ToolName.default);

    // result
    expect(state.lastMouseTool).toBe(ToolName.default);
  });

  it('should remember the last mouse tool when switching to the scale tool', () => {
    // mock
    const state = buildState();

    // before
    handleSetActiveTool(state, ToolName.scale);

    // result
    expect(state.lastMouseTool).toBe(ToolName.scale);
  });

  it('should keep the last mouse tool when switching to a non-mouse tool', () => {
    // mock
    const state = buildState({ lastMouseTool: ToolName.hand });

    // before
    handleSetActiveTool(state, ToolName.comment);

    // result
    expect(state.lastMouseTool).toBe(ToolName.hand);
  });

  it('should remember the last pen tool when switching to the pen tool', () => {
    // mock
    const state = buildState({ lastPenTool: ToolName.pencil });

    // before
    handleSetActiveTool(state, ToolName.pen);

    // result
    expect(state.lastPenTool).toBe(ToolName.pen);
  });

  it('should remember the last pen tool when switching to the pencil tool', () => {
    // mock
    const state = buildState();

    // before
    handleSetActiveTool(state, ToolName.pencil);

    // result
    expect(state.lastPenTool).toBe(ToolName.pencil);
  });

  it('should keep the last pen tool when switching to a non-pen-group tool', () => {
    // mock
    const state = buildState({ lastPenTool: ToolName.pencil });

    // before
    handleSetActiveTool(state, ToolName.comment);

    // result
    expect(state.lastPenTool).toBe(ToolName.pencil);
  });

  it('should remember the last text tool when switching to the text-on-path tool', () => {
    // mock
    const state = buildState();

    // before
    handleSetActiveTool(state, ToolName.textOnPath);

    // result
    expect(state.lastTextTool).toBe(ToolName.textOnPath);
  });

  it('should remember the last text tool when switching to the text tool', () => {
    // mock
    const state = buildState();

    // before
    handleSetActiveTool(state, ToolName.text);

    // result
    expect(state.lastTextTool).toBe(ToolName.text);
  });

  it('should keep the last text tool when switching to a non-text-group tool', () => {
    // mock
    const state = buildState({ lastTextTool: ToolName.textOnPath });

    // before
    handleSetActiveTool(state, ToolName.comment);

    // result
    expect(state.lastTextTool).toBe(ToolName.textOnPath);
  });

  it('should remember the last More tool when switching to the Shape builder tool', () => {
    // mock
    const state = buildState();

    // before
    handleSetActiveTool(state, ToolName.shapeBuilder);

    // result
    expect(state.lastMoreTool).toBe(ToolName.shapeBuilder);
  });

  it('should remember the last More tool when switching to the Variable width tool', () => {
    // mock
    const state = buildState();

    // before
    handleSetActiveTool(state, ToolName.variableWidth);

    // result
    expect(state.lastMoreTool).toBe(ToolName.variableWidth);
  });

  it('should keep the last More tool when switching to a non-More-group tool', () => {
    // mock
    const state = buildState({ lastMoreTool: ToolName.shapeBuilder });

    // before
    handleSetActiveTool(state, ToolName.comment);

    // result
    expect(state.lastMoreTool).toBe(ToolName.shapeBuilder);
  });
});
