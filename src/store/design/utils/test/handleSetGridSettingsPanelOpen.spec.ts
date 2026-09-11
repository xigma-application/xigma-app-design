// types
import { ToolName } from 'types/design/enums';
import { TDesignState } from '../../types';

// utils
import { handleSetGridSettingsPanelOpen } from '../handleSetGridSettingsPanelOpen';

const buildState = (overrides: Partial<TDesignState> = {}): TDesignState => ({
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
    },
  },
  penActiveVertexId: null,
  preferences: {
    areAdditionalLabelsVisible: true,
    areFrameOutlinesVisible: false,
    areMaskOutlinesVisible: false,
    areRulersVisible: false,
  },
  revealedMinMax: { maxHeight: false, maxWidth: false, minHeight: false, minWidth: false },
  vectorEditingNodeIds: [],
  ...overrides,
});

describe('handleSetGridSettingsPanelOpen', () => {
  it('should open the panel without touching the grid track selection', () => {
    // mock
    const state = buildState({ gridTrackSelection: { axis: 'column', frameId: 'frame-1', indices: [0] } });

    // before
    handleSetGridSettingsPanelOpen(state, true);

    // result
    expect(state.isGridSettingsPanelOpen).toBe(true);
    expect(state.gridTrackSelection).toEqual({ axis: 'column', frameId: 'frame-1', indices: [0] });
  });

  it('should close the panel and clear the grid track selection and section highlight', () => {
    // mock
    const state = buildState({
      gridSectionHighlight: { cells: [{ column: 0, row: 0 }], frameId: 'frame-1' },
      gridTrackSelection: { axis: 'column', frameId: 'frame-1', indices: [0] },
      isGridSettingsPanelOpen: true,
    });

    // before
    handleSetGridSettingsPanelOpen(state, false);

    // result
    expect(state.isGridSettingsPanelOpen).toBe(false);
    expect(state.gridTrackSelection).toBeNull();
    expect(state.gridSectionHighlight).toBeNull();
  });
});
