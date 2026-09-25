import { PDFName } from 'pdf-lib';

// types
import { NodeType } from 'types/design/enums';
import { TPolygonNode } from 'types/design/types';

// utils
import { drawPdfPolygonShape } from '../drawPdfPolygonShape';

const drawPdfPaintPolygonsMock = vi.fn();

vi.mock('../drawPdfPaintPolygons', () => ({ drawPdfPaintPolygons: (...args: unknown[]): void => drawPdfPaintPolygonsMock(...args) }));

const bounds = { height: 100, width: 100, x: 0, y: 0 };
const page = {} as never;
const states = new Map<number, PDFName>();
const fills = [{ color: '#ff0000', opacity: 100, type: 'solid' as const }];
const strokes = [{ color: '#0000ff', opacity: 100, type: 'solid' as const }];

const polygon = (overrides: Partial<TPolygonNode> = {}): TPolygonNode => ({
  fills,
  flipX: false,
  flipY: false,
  height: 20,
  id: 'e',
  name: 'e',
  parentId: null,
  rotation: 0,
  sides: 5,
  type: NodeType.polygon,
  width: 20,
  x: 0,
  y: 0,
  ...overrides,
});

describe('drawPdfPolygonShape', () => {
  beforeEach(() => {
    drawPdfPaintPolygonsMock.mockClear();
  });

  it('should draw the fill paints over the polygon shape with the node opacity', () => {
    // action
    drawPdfPolygonShape(page, polygon({ opacity: 0.5 }), {}, bounds, states);

    // result
    expect(drawPdfPaintPolygonsMock).toHaveBeenCalledTimes(1);
    expect(drawPdfPaintPolygonsMock.mock.calls[0][1]).toBe(fills);
    expect(drawPdfPaintPolygonsMock.mock.calls[0][2][0]).toHaveLength(5);
    expect(drawPdfPaintPolygonsMock.mock.calls[0][3]).toBe(0.5);
  });

  it('should draw the stroke paints over the stroke ring', () => {
    // action
    drawPdfPolygonShape(page, polygon({ strokeWidth: 4, strokes }), {}, bounds, states);

    // result
    expect(drawPdfPaintPolygonsMock).toHaveBeenCalledTimes(2);
    expect(drawPdfPaintPolygonsMock.mock.calls[1][1]).toBe(strokes);
  });

  it('should skip the stroke without a stroke width', () => {
    // action
    drawPdfPolygonShape(page, polygon({ strokes }), {}, bounds, states);

    // result
    expect(drawPdfPaintPolygonsMock).toHaveBeenCalledTimes(1);
  });
});
