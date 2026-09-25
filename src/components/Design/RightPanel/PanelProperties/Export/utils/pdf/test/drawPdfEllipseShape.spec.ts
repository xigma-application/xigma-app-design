import { PDFName } from 'pdf-lib';

// others
import { ELLIPSE_SEGMENTS } from 'constant/canvas';

// types
import { NodeType } from 'types/design/enums';
import { TEllipseNode } from 'types/design/types';

// utils
import { drawPdfEllipseShape } from '../drawPdfEllipseShape';

const drawPdfPaintPolygonsMock = vi.fn();

vi.mock('../drawPdfPaintPolygons', () => ({ drawPdfPaintPolygons: (...args: unknown[]): void => drawPdfPaintPolygonsMock(...args) }));

const bounds = { height: 100, width: 100, x: 0, y: 0 };
const page = {} as never;
const states = new Map<number, PDFName>();
const fills = [{ color: '#ff0000', opacity: 100, type: 'solid' as const }];
const strokes = [{ color: '#0000ff', opacity: 100, type: 'solid' as const }];

const ellipse = (overrides: Partial<TEllipseNode> = {}): TEllipseNode => ({
  fills,
  height: 20,
  id: 'e',
  name: 'e',
  parentId: null,
  rotation: 0,
  type: NodeType.ellipse,
  width: 20,
  x: 0,
  y: 0,
  ...overrides,
});

describe('drawPdfEllipseShape', () => {
  beforeEach(() => {
    drawPdfPaintPolygonsMock.mockClear();
  });

  it('should draw the fill paints over the ellipse shape with the node opacity', () => {
    // action
    drawPdfEllipseShape(page, ellipse({ opacity: 0.5 }), {}, bounds, states);

    // result
    expect(drawPdfPaintPolygonsMock).toHaveBeenCalledTimes(1);
    expect(drawPdfPaintPolygonsMock.mock.calls[0][1]).toBe(fills);
    expect(drawPdfPaintPolygonsMock.mock.calls[0][2][0]).toHaveLength(ELLIPSE_SEGMENTS);
    expect(drawPdfPaintPolygonsMock.mock.calls[0][3]).toBe(0.5);
  });

  it('should draw the stroke paints over the stroke ring', () => {
    // action
    drawPdfEllipseShape(page, ellipse({ strokeWidth: 4, strokes }), {}, bounds, states);

    // result
    expect(drawPdfPaintPolygonsMock).toHaveBeenCalledTimes(2);
    expect(drawPdfPaintPolygonsMock.mock.calls[1][1]).toBe(strokes);
  });

  it('should skip the stroke without a stroke width', () => {
    // action
    drawPdfEllipseShape(page, ellipse({ strokes }), {}, bounds, states);

    // result
    expect(drawPdfPaintPolygonsMock).toHaveBeenCalledTimes(1);
  });
});
