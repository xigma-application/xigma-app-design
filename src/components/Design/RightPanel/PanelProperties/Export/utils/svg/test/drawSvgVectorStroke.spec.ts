// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { drawSvgVectorStroke } from '../drawSvgVectorStroke';

const getVectorNodeThickStrokeVerticesMock = vi.fn();
const drawSvgPolygonsMock = vi.fn();

vi.mock('utils/canvas/vectorNetwork/getVectorNodeThickStrokeVertices/getVectorNodeThickStrokeVertices', () => ({
  getVectorNodeThickStrokeVertices: (...args: unknown[]): unknown => getVectorNodeThickStrokeVerticesMock(...args),
}));
const getVectorStrokeShapeMock = vi.fn<(...args: unknown[]) => unknown>(() => null);

vi.mock('utils/canvas/vector/stroke/getVectorStrokeShape', () => ({
  getVectorStrokeShape: (...args: unknown[]): unknown => getVectorStrokeShapeMock(...args),
}));
vi.mock('../drawSvgPolygons', () => ({ drawSvgPolygons: (...args: unknown[]): void => drawSvgPolygonsMock(...args) }));

const bounds = { height: 100, width: 100, x: 0, y: 0 };

const node = (overrides: Partial<TVectorNode> = {}): TVectorNode => ({
  defaultFill: null,
  filledFaceKeys: [],
  id: 'v',
  name: 'v',
  parentId: null,
  rotation: 0,
  segments: {},
  strokeColor: '#000000',
  strokeWidth: 2,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: {},
  ...overrides,
});

describe('drawSvgVectorStroke', () => {
  beforeEach(() => {
    getVectorNodeThickStrokeVerticesMock.mockReset();
    drawSvgPolygonsMock.mockClear();
  });

  it('should draw the triangulated stroke as a nonzero filled path in the stroke color', () => {
    // mock
    getVectorNodeThickStrokeVerticesMock.mockReturnValue([0, 0, 10, 0, 10, 10]);

    // action
    drawSvgVectorStroke([], node(), 0.5, bounds);

    // result
    expect(getVectorNodeThickStrokeVerticesMock).toHaveBeenCalledWith(node(), 1);
    expect(drawSvgPolygonsMock).toHaveBeenCalledTimes(1);
    expect(drawSvgPolygonsMock.mock.calls[0][1]).toHaveLength(1);
    expect(drawSvgPolygonsMock.mock.calls[0][2]).toBe('#000000');
    expect(drawSvgPolygonsMock.mock.calls[0][3]).toBe(0.5);
    expect(drawSvgPolygonsMock.mock.calls[0][5]).toBe('nonzero');
  });

  it('should skip drawing when the stroke width is zero', () => {
    // action
    drawSvgVectorStroke([], node({ strokeWidth: 0 }), 1, bounds);

    // result
    expect(drawSvgPolygonsMock).not.toHaveBeenCalled();
  });

  it('should skip drawing when the stroke color is empty', () => {
    // action
    drawSvgVectorStroke([], node({ strokeColor: '' }), 1, bounds);

    // result
    expect(drawSvgPolygonsMock).not.toHaveBeenCalled();
  });

  it('should draw a stroke mode shape even-odd instead of the plain stroke', () => {
    // mock
    const polygons = [[{ x: 0, y: 0 }]];

    getVectorStrokeShapeMock.mockReturnValueOnce({ fillRule: 'evenOdd', polygons });

    // action
    drawSvgVectorStroke([], node(), 1, bounds);

    // result
    expect(getVectorNodeThickStrokeVerticesMock).not.toHaveBeenCalled();
    expect(drawSvgPolygonsMock).toHaveBeenCalledWith([], polygons, '#000000', 1, bounds, 'evenodd');
  });
});
