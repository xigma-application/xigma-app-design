// types
import { NodeType, StrokeJoin, ToolName } from 'types/design/enums';
import { THoverResolverContext } from '../../types';
import { TLineNode } from 'types/design/types';

// utils
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { resolveOffsetVectorHover } from '../resolveOffsetVectorHover';

const getRotatedCursorUrlMock = vi.fn();

vi.mock('utils/canvas/createCursorRotator/getRotatedCursorUrl', () => ({
  getRotatedCursorUrl: (...args: unknown[]): unknown => getRotatedCursorUrlMock(...args),
}));

const line: TLineNode = {
  height: 0,
  id: 'line',
  name: 'Line',
  parentId: null,
  rotation: 0,
  strokes: [],
  type: NodeType.line,
  width: 100,
  x: 0,
  y: 0,
};

const createContext = (overrides: Partial<THoverResolverContext>): THoverResolverContext => ({
  activeTool: ToolName.default,
  editingContent: '',
  editingNodeId: null,
  editingTextBox: null,
  gradientEditor: null,
  imageEditor: null,
  isControlPressed: false,
  leafNodes: [],
  nodesById: { line },
  offsetVector: { distance: 10, join: StrokeJoin.miter, nodeId: 'line' },
  openPropertyPanel: null,
  point: { x: 50, y: 11 },
  refs: createCanvasRefs(),
  resizableSelectedNodes: [],
  resizeHandleHit: null,
  selectedNodes: [],
  smartSelectionNodes: [],
  vectorMultiSelectBox: null,
  vectorMultiSelectResizeHandle: null,
  viewport: { x: 0, y: 0, zoom: 1 },
  ...overrides,
});

describe('resolveOffsetVectorHover', () => {
  beforeEach(() => {
    getRotatedCursorUrlMock.mockReset();
    getRotatedCursorUrlMock.mockReturnValue('rotated');
  });

  it('should turn the resize cursor across the offset outline under the pointer and remember the edge', () => {
    // mock
    const context = createContext({});

    // before
    const result = resolveOffsetVectorHover(context);

    // result
    expect(result).toEqual({ className: null, cursor: 'rotated', nodeId: null });
    expect(getRotatedCursorUrlMock.mock.calls[0][0]).toBe('resize');
    expect(getRotatedCursorUrlMock.mock.calls[0][1]).toBeCloseTo(90);
    expect(context.refs.offsetVector.hoveredOffsetVectorEdgeRef.current?.point.y).toBeCloseTo(10);
  });

  it('should keep the angle of the grabbed edge while dragging', () => {
    // mock
    const context = createContext({ point: { x: 50, y: 60 } });
    context.refs.offsetVector.offsetVectorDragRef.current = {
      angle: 45,
      normal: { x: 0, y: 1 },
      point: { x: 0, y: 0 },
      startDistance: 10,
      startPoint: { x: 0, y: 0 },
    };

    // before
    resolveOffsetVectorHover(context);

    // result
    expect(getRotatedCursorUrlMock).toHaveBeenCalledWith('resize', 45);
  });

  it('should give a plain cursor and no hover away from the outline, and a plain cursor when the rotated one is missing', () => {
    // mock
    const away = createContext({ point: { x: 50, y: 60 } });

    // result
    expect(resolveOffsetVectorHover(away)).toEqual({ className: null, cursor: '', nodeId: null });
    expect(away.refs.offsetVector.hoveredOffsetVectorEdgeRef.current).toBeNull();

    getRotatedCursorUrlMock.mockReturnValue(null);
    expect(resolveOffsetVectorHover(createContext({}))?.cursor).toBe('');
  });

  it('should step aside outside the offset mode', () => {
    // result
    expect(resolveOffsetVectorHover(createContext({ offsetVector: null }))).toBeUndefined();
    expect(resolveOffsetVectorHover(createContext({ nodesById: {} }))).toBeUndefined();
  });
});
