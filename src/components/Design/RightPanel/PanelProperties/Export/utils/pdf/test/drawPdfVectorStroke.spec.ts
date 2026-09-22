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
vi.mock('../drawPdfPolygons', () => ({ drawPdfPolygons: (...args: unknown[]): void => drawPdfPolygonsMock(...args) }));

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
  strokeColor: '#000000',
  strokeWidth: 2,
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

  it('should skip drawing when the stroke color is empty', () => {
    // action
    drawPdfVectorStroke(page, node({ strokeColor: '' }), 1, bounds, states);

    // result
    expect(drawPdfPolygonsMock).not.toHaveBeenCalled();
  });
});
