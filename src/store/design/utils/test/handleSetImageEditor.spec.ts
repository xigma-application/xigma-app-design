// types
import { NodeType, ToolName } from 'types/design/enums';
import { TDesignPage, TDesignState, TImageEditorState } from '../../types';
import { TRectangleNode } from 'types/design/types';

// utils
import { handleSetImageEditor } from '../handleSetImageEditor';

const node: TRectangleNode = {
  cornerRadius: 0,
  fills: [{ opacity: 100, ref: 'image-1', rotation: 0, scaleMode: 'fill', type: 'image' }],
  height: 100,
  id: 'node-1',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 200,
  x: 10,
  y: 20,
};

const buildState = (nodes: TDesignPage['nodes'], imageEditor: TImageEditorState | null = null): TDesignState => ({
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
  imageEditor,
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
      nodes,
      paint: { color: '#d9d9d9', opacity: 100, type: 'solid' },
      rootOrder: Object.keys(nodes),
      selectedIds: [],
      viewport: { x: 0, y: 0, zoom: 1 },
    },
  },
  patternSourcePickTarget: null,
  penActiveVertexId: null,
  preferences: {
    areAdditionalLabelsVisible: true,
    areFrameOutlinesVisible: false,
    areMaskOutlinesVisible: false,
    areRulersVisible: false,
  },
  revealedMinMax: { maxHeight: false, maxWidth: false, minHeight: false, minWidth: false },
  vectorEditingNodeIds: [],
});

describe('handleSetImageEditor', () => {
  it('should clear the editor when the payload is null', () => {
    // mock
    const state = buildState({ 'node-1': node }, { mode: 'crop', nodeId: 'node-1', paintIndex: 0 });

    // before
    handleSetImageEditor(state, null);

    // result
    expect(state.imageEditor).toBeNull();
  });

  it('should not capture a cancel snapshot when entering a non-crop mode', () => {
    // mock
    const state = buildState({ 'node-1': node });

    // before
    handleSetImageEditor(state, { mode: 'position', nodeId: 'node-1', paintIndex: 0 });

    // result
    expect(state.imageEditor).toEqual({ mode: 'position', nodeId: 'node-1', paintIndex: 0 });
  });

  it("should capture the node's current appearance as a cancel snapshot when entering crop mode for a new target", () => {
    // mock
    const state = buildState({ 'node-1': node });

    // before
    handleSetImageEditor(state, { mode: 'crop', nodeId: 'node-1', paintIndex: 0 });

    // result
    expect(state.imageEditor?.cropCancelSnapshot).toEqual({
      cornerRadius: 0,
      fills: node.fills,
      height: 100,
      rotation: 0,
      width: 200,
      x: 10,
      y: 20,
    });
  });

  it('should keep the existing cancel snapshot when re-dispatching crop mode for the same target (e.g. selectedTarget changes)', () => {
    // mock
    const state = buildState(
      { 'node-1': node },
      {
        cropCancelSnapshot: { cornerRadius: 0, fills: node.fills, height: 100, rotation: 0, width: 200, x: 10, y: 20 },
        mode: 'crop',
        nodeId: 'node-1',
        paintIndex: 0,
      },
    );

    // mutate the node afterwards, simulating a crop edit already committed since entering crop mode
    state.pages['page-1'].nodes['node-1'] = { ...node, width: 999 };

    // before — a resolver spreads the existing imageEditor and only changes selectedTarget
    handleSetImageEditor(state, { mode: 'crop', nodeId: 'node-1', paintIndex: 0, selectedTarget: 'image' });

    // result — the ORIGINAL (pre-edit) snapshot survives, not a freshly captured (already-edited) one
    expect(state.imageEditor?.cropCancelSnapshot).toEqual({
      cornerRadius: 0,
      fills: node.fills,
      height: 100,
      rotation: 0,
      width: 200,
      x: 10,
      y: 20,
    });
    expect(state.imageEditor?.selectedTarget).toBe('image');
  });

  it('should capture a fresh cancel snapshot when the crop target (paintIndex) changes while already in crop mode', () => {
    // mock
    const secondFillNode: TRectangleNode = {
      ...node,
      fills: [node.fills[0], { opacity: 100, ref: 'image-2', rotation: 0, scaleMode: 'fill', type: 'image' }],
      width: 300,
    };
    const state = buildState(
      { 'node-1': secondFillNode },
      {
        cropCancelSnapshot: { cornerRadius: 0, fills: node.fills, height: 100, rotation: 0, width: 200, x: 10, y: 20 },
        mode: 'crop',
        nodeId: 'node-1',
        paintIndex: 0,
      },
    );

    // before — the picker switches to a different fill row on the same node, still in crop mode
    handleSetImageEditor(state, { mode: 'crop', nodeId: 'node-1', paintIndex: 1 });

    // result — a new snapshot reflecting the node's CURRENT appearance, not the stale one from fill 0
    expect(state.imageEditor?.cropCancelSnapshot).toEqual({
      cornerRadius: 0,
      fills: secondFillNode.fills,
      height: 100,
      rotation: 0,
      strokes: secondFillNode.strokes,
      width: 300,
      x: 10,
      y: 20,
    });
  });

  it('should not capture a snapshot when the target node does not exist', () => {
    // mock
    const state = buildState({});

    // before
    handleSetImageEditor(state, { mode: 'crop', nodeId: 'missing-node', paintIndex: 0 });

    // result
    expect(state.imageEditor).toEqual({ cropCancelSnapshot: undefined, mode: 'crop', nodeId: 'missing-node', paintIndex: 0 });
  });
});
