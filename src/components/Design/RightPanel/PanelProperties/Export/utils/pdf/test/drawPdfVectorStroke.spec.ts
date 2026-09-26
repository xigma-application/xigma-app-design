import { PDFName } from 'pdf-lib';

// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { drawPdfVectorStroke } from '../drawPdfVectorStroke';

const getVectorNodeThickStrokeVerticesMock = vi.fn();
const drawPdfPolygonsMock = vi.fn();

vi.mock('utils/canvas/vectorNetwork/getVectorNodeThickStrokeVertices/getVectorNodeThickStrokeVertices', () => ({
  getVectorNodeThickStrokeVertices: (...args: unknown[]): unknown => getVectorNodeThickStrokeVerticesMock(...args),
}));
const getVectorStrokeShapeMock = vi.fn<(...args: unknown[]) => unknown>(() => null);

vi.mock('utils/canvas/vector/stroke/getVectorStrokeShape', () => ({
  getVectorStrokeShape: (...args: unknown[]): unknown => getVectorStrokeShapeMock(...args),
}));
vi.mock('../drawPdfPolygons', () => ({ drawPdfPolygons: (...args: unknown[]): void => drawPdfPolygonsMock(...args) }));

const drawPdfPaintPolygonsMock = vi.fn();

vi.mock('../drawPdfPaintPolygons', () => ({
  drawPdfPaintPolygons: (...args: unknown[]): void => drawPdfPaintPolygonsMock(...args),
}));

const bounds = { height: 100, width: 100, x: 0, y: 0 };
const page = {} as never;
const states = new Map<number, PDFName>();

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

describe('drawPdfVectorStroke', () => {
  beforeEach(() => {
    getVectorNodeThickStrokeVerticesMock.mockReset();
    drawPdfPolygonsMock.mockClear();
  });

  it('should draw the triangulated stroke as a non-zero filled path in the stroke color', () => {
    // mock
    getVectorNodeThickStrokeVerticesMock.mockReturnValue([0, 0, 10, 0, 10, 10]);

    // action
    drawPdfVectorStroke(page, node(), 0.5, bounds, states);

    // result
    expect(getVectorNodeThickStrokeVerticesMock).toHaveBeenCalledWith(node(), 1);
    expect(drawPdfPolygonsMock).toHaveBeenCalledTimes(1);
    expect(drawPdfPolygonsMock.mock.calls[0][1]).toHaveLength(1);
    expect(drawPdfPolygonsMock.mock.calls[0][2]).toBe('#000000');
    expect(drawPdfPolygonsMock.mock.calls[0][3]).toBe(0.5);
    expect(drawPdfPolygonsMock.mock.calls[0][6]).toBe('nonZero');
  });

  it('should skip drawing when the stroke width is zero', () => {
    // action
    drawPdfVectorStroke(page, node({ strokeWidth: 0 }), 1, bounds, states);

    // result
    expect(drawPdfPolygonsMock).not.toHaveBeenCalled();
  });

  it('should skip drawing when the vector has no strokes', () => {
    // action
    drawPdfVectorStroke(page, node({ strokes: [] }), 1, bounds, states);

    // result
    expect(drawPdfPolygonsMock).not.toHaveBeenCalled();
  });

  it('should draw a stroke mode shape with its fill rule instead of the plain stroke', () => {
    // mock
    const polygons = [[{ x: 0, y: 0 }]];

    getVectorStrokeShapeMock.mockReturnValueOnce([{ fillRule: 'evenOdd', polygons }]);

    // action
    drawPdfVectorStroke(page, node(), 1, bounds, states);

    // result
    expect(getVectorNodeThickStrokeVerticesMock).not.toHaveBeenCalled();
    expect(drawPdfPolygonsMock).toHaveBeenCalledWith(page, polygons, '#000000', 1, bounds, states, 'evenOdd');
  });

  it('should draw a gradient stroke shape through the paint polygons over the vector bounds', () => {
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
    drawPdfVectorStroke(page, node({ strokes: [gradient] }), 1, bounds, states);

    // result
    expect(drawPdfPaintPolygonsMock).toHaveBeenCalledWith(page, [gradient], polygons, 1, bounds, states, { height: 0, width: 0, x: 0, y: 0 });
    expect(drawPdfPolygonsMock).not.toHaveBeenCalled();
  });
});
