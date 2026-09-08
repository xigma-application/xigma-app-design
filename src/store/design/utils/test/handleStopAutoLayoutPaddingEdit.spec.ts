// types
import { ToolName } from 'types/design/enums';
import { TDesignState } from '../../types';

// utils
import { handleStopAutoLayoutPaddingEdit } from '../handleStopAutoLayoutPaddingEdit';

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

describe('handleStopAutoLayoutPaddingEdit', () => {
  it('should clear the editing state when the frame and side match', () => {
    // mock
    const state = buildState({ editingAutoLayoutPadding: { frameId: 'frame-1', point: { x: 0, y: 0 }, side: 'left' } });

    // before
    handleStopAutoLayoutPaddingEdit(state, { frameId: 'frame-1', side: 'left' });

    // result
    expect(state.editingAutoLayoutPadding).toBeNull();
  });

  it('should keep the editing state when the frame does not match', () => {
    // mock
    const state = buildState({ editingAutoLayoutPadding: { frameId: 'frame-1', point: { x: 0, y: 0 }, side: 'left' } });

    // before
    handleStopAutoLayoutPaddingEdit(state, { frameId: 'frame-2', side: 'left' });

    // result
    expect(state.editingAutoLayoutPadding).toEqual({ frameId: 'frame-1', point: { x: 0, y: 0 }, side: 'left' });
  });

  it('should keep the editing state when the side does not match', () => {
    // mock
    const state = buildState({ editingAutoLayoutPadding: { frameId: 'frame-1', point: { x: 0, y: 0 }, side: 'left' } });

    // before
    handleStopAutoLayoutPaddingEdit(state, { frameId: 'frame-1', side: 'top' });

    // result
    expect(state.editingAutoLayoutPadding).toEqual({ frameId: 'frame-1', point: { x: 0, y: 0 }, side: 'left' });
  });

  it('should do nothing when nothing is being edited', () => {
    // mock
    const state = buildState();

    // before
    handleStopAutoLayoutPaddingEdit(state, { frameId: 'frame-1', side: 'left' });

    // result
    expect(state.editingAutoLayoutPadding).toBeUndefined();
  });
});
