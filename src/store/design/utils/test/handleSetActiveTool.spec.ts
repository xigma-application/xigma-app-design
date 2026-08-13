// types
import { ToolName } from 'types/design/enums';
import { TDesignState } from '../../types';

// utils
import { handleSetActiveTool } from '../handleSetActiveTool';

const buildState = (overrides: Partial<TDesignState> = {}): TDesignState => ({
  activeTool: ToolName.default,
  editingNodeId: null,
  editingTextBox: null,
  editingTextContent: '',
  lastMouseTool: ToolName.default,
  lastShapeTool: ToolName.rectangle,
  nodes: {},
  rootOrder: [],
  selectedIds: [],
  viewport: { x: 0, y: 0, zoom: 1 },
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

  it('should keep the last shape tool when switching to a non-shape tool', () => {
    // mock
    const state = buildState({ lastShapeTool: ToolName.ellipse });

    // before
    handleSetActiveTool(state, ToolName.comment);

    // result
    expect(state.lastShapeTool).toBe(ToolName.ellipse);
  });

  it('should remember the last mouse tool when switching to the hand tool', () => {
    // mock
    const state = buildState();

    // before
    handleSetActiveTool(state, ToolName.hand);

    // result
    expect(state.lastMouseTool).toBe(ToolName.hand);
  });

  it('should keep the last mouse tool when switching to a non-mouse tool', () => {
    // mock
    const state = buildState({ lastMouseTool: ToolName.hand });

    // before
    handleSetActiveTool(state, ToolName.comment);

    // result
    expect(state.lastMouseTool).toBe(ToolName.hand);
  });
});
