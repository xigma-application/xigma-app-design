// types
import { ToolName } from 'types/design/enums';
import { TDesignState } from '../../types';

// utils
import { resetGridTrackAffordanceState } from '../resetGridTrackAffordanceState';

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

describe('resetGridTrackAffordanceState', () => {
  it('should clear the grid track selection, the section highlight and close the panel', () => {
    // mock
    const state = buildState({
      gridSectionHighlight: { cells: [{ column: 0, row: 0 }], frameId: 'frame-1' },
      gridTrackSelection: { axis: 'column', frameId: 'frame-1', indices: [0, 1] },
      isGridSettingsPanelOpen: true,
      panelGridTrackSelection: { axis: 'column', frameId: 'frame-1', indices: [0, 1] },
    });

    // before
    resetGridTrackAffordanceState(state);

    // result
    expect(state.gridTrackSelection).toBeNull();
    expect(state.panelGridTrackSelection).toBeNull();
    expect(state.gridSectionHighlight).toBeNull();
    expect(state.isGridSettingsPanelOpen).toBe(false);
  });

  it('should leave an already-closed state untouched', () => {
    // mock
    const state = buildState();

    // before
    resetGridTrackAffordanceState(state);

    // result
    expect(state.gridTrackSelection).toBeNull();
    expect(state.panelGridTrackSelection).toBeNull();
    expect(state.gridSectionHighlight).toBeNull();
    expect(state.isGridSettingsPanelOpen).toBe(false);
  });
});
