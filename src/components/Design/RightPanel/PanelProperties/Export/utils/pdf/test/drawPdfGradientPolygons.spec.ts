import { PDFName } from 'pdf-lib';

// types
import { TGradientPaint } from 'types/design/paint/types';

// utils
import { drawPdfGradientPolygons } from '../drawPdfGradientPolygons';

const getPdfAxialShadingPatternMock = vi.fn();
const getPdfRadialShadingPatternMock = vi.fn();
const registerPdfPatternMock = vi.fn();

vi.mock('../getPdfAxialShadingPattern', () => ({
  getPdfAxialShadingPattern: (...args: unknown[]): unknown => getPdfAxialShadingPatternMock(...args),
}));
vi.mock('../getPdfRadialShadingPattern', () => ({
  getPdfRadialShadingPattern: (...args: unknown[]): unknown => getPdfRadialShadingPatternMock(...args),
}));
vi.mock('../registerPdfPattern', () => ({ registerPdfPattern: (...args: unknown[]): unknown => registerPdfPatternMock(...args) }));

const bounds = { height: 100, width: 100, x: 0, y: 0 };
const polygons = [
  [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    { x: 10, y: 10 },
  ],
];
const states = new Map<number, PDFName>();

const linearPaint: TGradientPaint = {
  end: { x: 10, y: 0 },
  opacity: 100,
  start: { x: 0, y: 0 },
  stops: [
    { color: '#ff0000', opacity: 100, position: 0 },
    { color: '#0000ff', opacity: 100, position: 1 },
  ],
  type: 'gradient-linear',
};

describe('drawPdfGradientPolygons', () => {
  beforeEach(() => {
    getPdfAxialShadingPatternMock.mockReset();
    getPdfRadialShadingPatternMock.mockReset();
    registerPdfPatternMock.mockReset();
    registerPdfPatternMock.mockReturnValue(PDFName.of('XigmaPattern0'));
  });

  it('should build an axial pattern for a linear gradient and paint the path as a pattern fill', () => {
    // mock
    getPdfAxialShadingPatternMock.mockReturnValue({ PatternType: 2 });

    const pushOperators = vi.fn();
    const context = { obj: (value: unknown): unknown => value, register: (): string => 'ref' };
    const page = { doc: { context }, node: { setExtGState: vi.fn() }, pushOperators } as never;

    // action
    drawPdfGradientPolygons(page, linearPaint, polygons, 0.5, bounds, states);

    // result
    expect(getPdfAxialShadingPatternMock).toHaveBeenCalledWith(context, linearPaint.stops, expect.any(Object));
    expect(getPdfRadialShadingPatternMock).not.toHaveBeenCalled();
    expect(registerPdfPatternMock).toHaveBeenCalledWith(page, { PatternType: 2 });

    const rendered = pushOperators.mock.calls[0].map((operator: { toString: () => string }) => operator.toString());

    expect(rendered).toEqual([
      'q',
      '/XigmaOpacity0 gs',
      '/Pattern cs',
      '/XigmaPattern0 scn',
      '0 100 m',
      '10 100 l',
      '10 90 l',
      'h',
      'f*',
      'Q',
    ]);
  });

  it('should build a radial pattern for a radial gradient', () => {
    // mock
    getPdfRadialShadingPatternMock.mockReturnValue({ Matrix: [1, 0, 0, 1, 0, 0], PatternType: 2 });

    const context = { obj: (value: unknown): unknown => value, register: (): string => 'ref' };
    const page = { doc: { context }, node: { setExtGState: vi.fn() }, pushOperators: vi.fn() } as never;

    // action
    drawPdfGradientPolygons(page, { ...linearPaint, radiusRatio: 0.5, type: 'gradient-radial' }, polygons, 1, bounds, states);

    // result
    expect(getPdfRadialShadingPatternMock).toHaveBeenCalledWith(context, linearPaint.stops, expect.any(Object), 0.5);
    expect(getPdfAxialShadingPatternMock).not.toHaveBeenCalled();
  });
});
