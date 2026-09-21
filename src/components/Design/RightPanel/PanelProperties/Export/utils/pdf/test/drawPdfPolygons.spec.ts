import { PDFName } from 'pdf-lib';

// utils
import { drawPdfPolygons } from '../drawPdfPolygons';

const bounds = { height: 100, width: 100, x: 10, y: 20 };

describe('drawPdfPolygons', () => {
  it('should fill every polygon in one even-odd path, flipped into page coordinates', () => {
    // mock
    const pushOperators = vi.fn();
    const page = {
      doc: { context: { obj: (value: unknown): unknown => value, register: (): string => 'ref' } },
      node: { setExtGState: vi.fn() },
      pushOperators,
    } as never;
    const polygon = [
      { x: 10, y: 20 },
      { x: 30, y: 20 },
      { x: 30, y: 40 },
    ];

    // action
    drawPdfPolygons(page, [polygon, [{ x: 0, y: 0 }]], '#ff0000', 0.5, bounds, new Map<number, PDFName>());

    // result
    const rendered = pushOperators.mock.calls[0].map((operator: { toString: () => string }) => operator.toString());

    expect(rendered).toEqual(['q', '/XigmaOpacity0 gs', '1 0 0 rg', '0 100 m', '20 100 l', '20 80 l', 'h', 'f*', 'Q']);
  });
});
