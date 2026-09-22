// types
import { TGradientPaint } from 'types/design/paint/types';

// utils
import { drawSvgGradientPolygons } from '../drawSvgGradientPolygons';

const getSvgLinearGradientDefMock = vi.fn();
const getSvgRadialGradientDefMock = vi.fn();

vi.mock('../getSvgLinearGradientDef', () => ({
  getSvgLinearGradientDef: (...args: unknown[]): unknown => getSvgLinearGradientDefMock(...args),
}));
vi.mock('../getSvgRadialGradientDef', () => ({
  getSvgRadialGradientDef: (...args: unknown[]): unknown => getSvgRadialGradientDefMock(...args),
}));

const bounds = { height: 100, width: 100, x: 0, y: 0 };
const polygons = [
  [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    { x: 10, y: 10 },
  ],
];

const linearPaint: TGradientPaint = {
  end: { x: 1, y: 0 },
  opacity: 100,
  start: { x: 0, y: 0 },
  stops: [
    { color: '#ff0000', opacity: 100, position: 0 },
    { color: '#0000ff', opacity: 100, position: 1 },
  ],
  type: 'gradient-linear',
};

describe('drawSvgGradientPolygons', () => {
  beforeEach(() => {
    getSvgLinearGradientDefMock.mockReset();
    getSvgRadialGradientDefMock.mockReset();
    getSvgLinearGradientDefMock.mockReturnValue('<linearGradient/>');
    getSvgRadialGradientDefMock.mockReturnValue('<radialGradient/>');
  });

  it('should register a linear gradient def and paint the path with its url', () => {
    // action
    const elements: string[] = [];
    const defs: string[] = [];

    drawSvgGradientPolygons(elements, defs, linearPaint, polygons, 0.5, bounds);

    // result
    expect(getSvgLinearGradientDefMock).toHaveBeenCalledWith('XigmaGradient0', linearPaint.stops, expect.any(Object));
    expect(getSvgRadialGradientDefMock).not.toHaveBeenCalled();
    expect(defs).toEqual(['<linearGradient/>']);
    expect(elements).toEqual(['<path d="M0 0 L10 0 L10 10 Z" fill="url(#XigmaGradient0)" fill-opacity="0.5" fill-rule="evenodd"/>']);
  });

  it('should register a radial gradient def with the radius ratio', () => {
    // action
    const elements: string[] = [];
    const defs: string[] = [];

    drawSvgGradientPolygons(elements, defs, { ...linearPaint, radiusRatio: 0.5, type: 'gradient-radial' }, polygons, 1, bounds);

    // result
    expect(getSvgRadialGradientDefMock).toHaveBeenCalledWith('XigmaGradient0', linearPaint.stops, expect.any(Object), 0.5);
    expect(getSvgLinearGradientDefMock).not.toHaveBeenCalled();
  });

  it('should use an explicit node bounds as the gradient fill bounds instead of the polygon extents', () => {
    // action
    const elements: string[] = [];
    const defs: string[] = [];
    const explicitNodeBounds = { height: 50, width: 50, x: 5, y: 5 };

    drawSvgGradientPolygons(elements, defs, linearPaint, polygons, 1, bounds, explicitNodeBounds);

    // result — start is normalized {x:0,y:0} placed inside the 50x50 explicit bounds at (5,5)
    expect(getSvgLinearGradientDefMock).toHaveBeenCalledWith(
      'XigmaGradient0',
      linearPaint.stops,
      expect.objectContaining({ start: { x: 5, y: 5 } }),
    );
  });

  it('should register each call under its own incrementing id', () => {
    // action
    const elements: string[] = [];
    const defs: string[] = [];

    drawSvgGradientPolygons(elements, defs, linearPaint, polygons, 1, bounds);
    drawSvgGradientPolygons(elements, defs, linearPaint, polygons, 1, bounds);

    // result
    expect(defs).toHaveLength(2);
    expect(elements[0]).toContain('url(#XigmaGradient0)');
    expect(elements[1]).toContain('url(#XigmaGradient1)');
  });
});
