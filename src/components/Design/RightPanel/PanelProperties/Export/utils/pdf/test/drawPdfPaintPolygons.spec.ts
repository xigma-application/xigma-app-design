import { PDFName } from 'pdf-lib';

// utils
import { drawPdfPaintPolygons } from '../drawPdfPaintPolygons';

const drawPdfPolygonsMock = vi.fn();

vi.mock('../drawPdfPolygons', () => ({ drawPdfPolygons: (...args: unknown[]): void => drawPdfPolygonsMock(...args) }));

const bounds = { height: 100, width: 100, x: 0, y: 0 };
const page = {} as never;
const polygons = [
  [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    { x: 10, y: 10 },
  ],
];
const states = new Map<number, PDFName>();

describe('drawPdfPaintPolygons', () => {
  beforeEach(() => {
    drawPdfPolygonsMock.mockClear();
  });

  it('should draw one visible solid paint with its opacity as a fraction', () => {
    // action
    drawPdfPaintPolygons(page, [{ color: '#00ff00', opacity: 40, type: 'solid' }], polygons, 1, bounds, states);

    // result
    expect(drawPdfPolygonsMock).toHaveBeenCalledTimes(1);
    expect(drawPdfPolygonsMock).toHaveBeenCalledWith(page, polygons, '#00ff00', 0.4, bounds, states);
  });

  it('should skip hidden and non-solid paints and draw the rest bottom to top', () => {
    // action
    drawPdfPaintPolygons(
      page,
      [
        { color: '#111111', opacity: 100, type: 'solid' },
        { color: '#222222', opacity: 100, type: 'solid', visible: false },
        { opacity: 100, ref: 'i', rotation: 0, scaleMode: 'fill', type: 'image' },
        { color: '#333333', opacity: 100, type: 'solid' },
      ],
      polygons,
      1,
      bounds,
      states,
    );

    // result
    expect(drawPdfPolygonsMock.mock.calls.map((call) => call[2])).toEqual(['#333333', '#111111']);
  });
});
