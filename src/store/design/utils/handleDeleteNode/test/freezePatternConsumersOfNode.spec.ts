// types
import { NodeType, ToolName } from 'types/design/enums';
import { TDesignPage, TDesignState } from '../../../types';
import { TFrameNode, TRectangleNode } from 'types/design/types';
import { TPatternPaint } from 'types/design/paint/types';

// utils
import { freezePatternConsumersOfNode } from '../freezePatternConsumersOfNode';
import { getActivePage } from '../../getActivePage';

const buildState = (nodes: TDesignPage['nodes']): TDesignState => ({
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
    areLayoutGuidesVisible: true,
    areMaskOutlinesVisible: false,
    areRulersVisible: false,
    resolvedTheme: 'dark',
  },
  revealedMinMax: { maxHeight: false, maxWidth: false, minHeight: false, minWidth: false },
  vectorEditingNodeIds: [],
  vectorPointSelection: { segmentIds: [], vertexIds: [] },
});

const patternRect = (id: string, sourceNodeId: string | null, overrides: Partial<TRectangleNode> = {}): TRectangleNode => ({
  fills: [
    {
      alignmentIndex: 0,
      direction: 'horizontal',
      offsetX: 0,
      offsetY: 0,
      opacity: 100,
      scale: 100,
      sourceNodeId,
      spacingX: 0,
      spacingY: 0,
      tileType: 'rectangular',
      type: 'pattern',
    },
  ],
  height: 20,
  id,
  name: id,
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 20,
  x: 0,
  y: 0,
  ...overrides,
});

const sourceRect = (id: string, overrides: Partial<TRectangleNode> = {}): TRectangleNode => ({
  fills: [{ color: '#00ff00', opacity: 100, type: 'solid' }],
  height: 20,
  id,
  name: id,
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 20,
  x: 0,
  y: 0,
  ...overrides,
});

describe('freezePatternConsumersOfNode', () => {
  it('should do nothing when the source node does not exist', () => {
    // mock
    const consumer = patternRect('consumer', 'missing-source');
    const state = buildState({ consumer });

    // before
    freezePatternConsumersOfNode(state, 'missing-source');

    // result
    expect(getActivePage(state).nodes.consumer).toEqual(consumer);
  });

  it('should freeze a snapshot of the source and clear sourceNodeId on every consumer that references it', () => {
    // mock
    const source = sourceRect('source-1');
    const consumer = patternRect('consumer', 'source-1');
    const state = buildState({ consumer, 'source-1': source });

    // before
    freezePatternConsumersOfNode(state, 'source-1');

    // result
    const fill = (getActivePage(state).nodes.consumer as TRectangleNode).fills[0];

    expect(fill).toMatchObject({ frozenSourceSnapshot: [source], sourceNodeId: null });
  });

  it('should include the source’s own descendants in the frozen snapshot', () => {
    // mock
    const child = sourceRect('child', { parentId: 'source-1' });
    const source: TFrameNode = { ...sourceRect('source-1'), childIds: ['child'], clipContent: false, type: NodeType.frame };
    const consumer = patternRect('consumer', 'source-1');
    const state = buildState({ child, consumer, 'source-1': source });

    // before
    freezePatternConsumersOfNode(state, 'source-1');

    // result
    const fill = (getActivePage(state).nodes.consumer as TRectangleNode).fills[0] as TPatternPaint;

    expect(fill.frozenSourceSnapshot).toEqual([source, child]);
  });

  it('should not touch a consumer pointed at a different source', () => {
    // mock
    const source = sourceRect('source-1');
    const other = sourceRect('other-source');
    const consumer = patternRect('consumer', 'other-source');
    const state = buildState({ consumer, 'other-source': other, 'source-1': source });

    // before
    freezePatternConsumersOfNode(state, 'source-1');

    // result
    const fill = (getActivePage(state).nodes.consumer as TRectangleNode).fills[0] as TPatternPaint;

    expect(fill.sourceNodeId).toBe('other-source');
    expect(fill.frozenSourceSnapshot).toBeUndefined();
  });

  it('should leave a non-pattern fill untouched', () => {
    // mock
    const source = sourceRect('source-1');
    const consumer = sourceRect('consumer');
    const state = buildState({ consumer, 'source-1': source });

    // before
    freezePatternConsumersOfNode(state, 'source-1');

    // result
    expect(getActivePage(state).nodes.consumer).toEqual(consumer);
  });

  it('should freeze the same snapshot onto every one of several consumers', () => {
    // mock
    const source = sourceRect('source-1');
    const consumerA = patternRect('a', 'source-1');
    const consumerB = patternRect('b', 'source-1');
    const state = buildState({ a: consumerA, b: consumerB, 'source-1': source });

    // before
    freezePatternConsumersOfNode(state, 'source-1');

    // result
    expect((getActivePage(state).nodes.a as TRectangleNode).fills[0]).toMatchObject({ sourceNodeId: null });
    expect((getActivePage(state).nodes.b as TRectangleNode).fills[0]).toMatchObject({ sourceNodeId: null });
  });

  it('should freeze a pattern used as a stroke too', () => {
    // mock
    const source = sourceRect('source-1');
    const { fills: strokes } = patternRect('stroke-pattern', 'source-1');
    const consumer = sourceRect('consumer', { strokes });
    const state = buildState({ consumer, 'source-1': source });

    // before
    freezePatternConsumersOfNode(state, 'source-1');

    // result
    const stroke = (getActivePage(state).nodes.consumer as TRectangleNode).strokes?.[0];

    expect(stroke).toMatchObject({ frozenSourceSnapshot: [source], sourceNodeId: null });
  });
});
