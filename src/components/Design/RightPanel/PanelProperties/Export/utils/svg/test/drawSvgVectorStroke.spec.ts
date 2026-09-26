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

const drawSvgPaintPolygonsMock = vi.fn();

vi.mock('../drawSvgPaintPolygons', () => ({
  drawSvgPaintPolygons: (...args: unknown[]): Promise<void> => drawSvgPaintPolygonsMock(...args),
}));

const bounds = { height: 100, width: 100, x: 0, y: 0 };

const node = (overrides: Partial<TVectorNode> = {}): TVectorNode => ({
  defaultFill: null,
  filledFaceKeys: [],
  id: 'v',
  name: 'v',
  parentId: null,
  rotation: 0,
  segments: {},
  strokeWidth: 2,
  strokes: [{ color: '#000000', opacity: 100, type: 'solid' }],
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

  it('should draw the triangulated stroke as a nonzero filled path in the stroke color', async () => {
    // mock
    getVectorNodeThickStrokeVerticesMock.mockReturnValue([0, 0, 10, 0, 10, 10]);

    // action
    await drawSvgVectorStroke([], [], node(), 0.5, bounds);

    // result
    expect(getVectorNodeThickStrokeVerticesMock).toHaveBeenCalledWith(node(), 1);
    expect(drawSvgPolygonsMock).toHaveBeenCalledTimes(1);
    expect(drawSvgPolygonsMock.mock.calls[0][1]).toHaveLength(1);
    expect(drawSvgPolygonsMock.mock.calls[0][2]).toBe('#000000');
    expect(drawSvgPolygonsMock.mock.calls[0][3]).toBe(0.5);
    expect(drawSvgPolygonsMock.mock.calls[0][5]).toBe('nonzero');
  });

  it('should skip drawing when the stroke width is zero', async () => {
    // action
    await drawSvgVectorStroke([], [], node({ strokeWidth: 0 }), 1, bounds);

    // result
    expect(drawSvgPolygonsMock).not.toHaveBeenCalled();
  });

  it('should skip drawing when the vector has no strokes', async () => {
    // action
    await drawSvgVectorStroke([], [], node({ strokes: [] }), 1, bounds);

    // result
    expect(drawSvgPolygonsMock).not.toHaveBeenCalled();
  });

  it('should draw every stroke mode shape with its own fill rule instead of the plain stroke', async () => {
    // mock
    const polygons = [[{ x: 0, y: 0 }]];
    const dashes = [[{ x: 1, y: 1 }]];

    getVectorStrokeShapeMock.mockReturnValueOnce([
      { fillRule: 'evenOdd', polygons },
      { fillRule: 'nonZero', polygons: dashes },
    ]);

    // action
    await drawSvgVectorStroke([], [], node(), 1, bounds);

    // result
    expect(getVectorNodeThickStrokeVerticesMock).not.toHaveBeenCalled();
    expect(drawSvgPolygonsMock).toHaveBeenCalledWith([], polygons, '#000000', 1, bounds, 'evenodd');
    expect(drawSvgPolygonsMock).toHaveBeenCalledWith([], dashes, '#000000', 1, bounds, 'nonzero');
  });

  it('should draw a gradient stroke shape through the paint polygons over the vector bounds', async () => {
    // mock
    const polygons = [[{ x: 0, y: 0 }]];
    const gradient = {
      end: { x: 1, y: 0 },
      opacity: 100,
      start: { x: 0, y: 0 },
      stops: [
        { color: '#ff0000', opacity: 100, position: 0 },
        { color: '#0000ff', opacity: 100, position: 1 },
      ],
      type: 'gradient-linear' as const,
    };

    getVectorStrokeShapeMock.mockReturnValueOnce([{ fillRule: 'evenOdd', polygons }]);

    // action
    await drawSvgVectorStroke([], [], node({ strokes: [gradient] }), 1, bounds);

    // result
    expect(drawSvgPaintPolygonsMock).toHaveBeenCalledWith([], [], [gradient], polygons, 1, bounds, { height: 0, width: 0, x: 0, y: 0 });
    expect(drawSvgPolygonsMock).not.toHaveBeenCalled();
  });
});
