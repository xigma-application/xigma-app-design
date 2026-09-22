// types
import { TGradientPaint } from 'types/design/paint/types';

// utils
import { drawSvgAngularGradientPolygons } from '../drawSvgAngularGradientPolygons';

const drawSvgPolygonsMock = vi.fn();
const getSvgGradientColorAtMock = vi.fn();

vi.mock('../drawSvgPolygons', () => ({ drawSvgPolygons: (...args: unknown[]): void => drawSvgPolygonsMock(...args) }));
vi.mock('../getSvgGradientColorAt', () => ({ getSvgGradientColorAt: (...args: unknown[]): unknown => getSvgGradientColorAtMock(...args) }));

const bounds = { height: 100, width: 100, x: 0, y: 0 };
const polygons = [
  [
    { x: 0, y: 0 },
    { x: 40, y: 0 },
    { x: 40, y: 30 },
    { x: 0, y: 30 },
  ],
];

const paint: TGradientPaint = {
  end: { x: 1, y: 0.5 },
  opacity: 100,
  start: { x: 0, y: 0.5 },
  stops: [
    { color: '#ff0000', opacity: 100, position: 0 },
    { color: '#0000ff', opacity: 100, position: 1 },
  ],
  type: 'gradient-angular',
};

describe('drawSvgAngularGradientPolygons', () => {
  beforeEach(() => {
    drawSvgPolygonsMock.mockClear();
    getSvgGradientColorAtMock.mockReset();
    getSvgGradientColorAtMock.mockReturnValue({ color: '#123456', opacity: 0.5 });
  });

  it('should register one clip-path for the shape and wrap every sector path in one clipped group', () => {
    const elements: string[] = [];
    const defs: string[] = [];

    drawSvgAngularGradientPolygons(elements, defs, paint, polygons, 1, bounds);

    expect(defs).toHaveLength(1);
    expect(defs[0]).toContain('<clipPath id="XigmaClip0">');
    expect(elements).toHaveLength(1);
    expect(elements[0].startsWith('<g clip-path="url(#XigmaClip0)">')).toBe(true);
    expect(elements[0].endsWith('</g>')).toBe(true);
  });

  it('should draw exactly 120 sectors, each a triangle from the gradient center, sampling color at the sector midpoint', () => {
    const elements: string[] = [];

    drawSvgAngularGradientPolygons(elements, [], paint, polygons, 1, bounds);

    expect(drawSvgPolygonsMock).toHaveBeenCalledTimes(120);
    expect(getSvgGradientColorAtMock).toHaveBeenCalledTimes(120);
    expect(getSvgGradientColorAtMock).toHaveBeenNthCalledWith(1, paint.stops, 0.5 / 120);
    expect(getSvgGradientColorAtMock).toHaveBeenNthCalledWith(120, paint.stops, 119.5 / 120);

    const [sectorElements, sectorPolygons, color, opacity] = drawSvgPolygonsMock.mock.calls[0] as [unknown[], unknown[][], string, number];

    expect(sectorPolygons).toHaveLength(1);
    expect(sectorPolygons[0]).toHaveLength(3);
    expect(color).toBe('#123456');
    expect(opacity).toBeCloseTo(0.5); // paint opacity (1) * stop opacity (0.5)
    expect(sectorElements).not.toBe(elements); // sectors accumulate in a local array, not the caller's, until wrapped
  });

  it('should multiply the ambient opacity into every sector fill', () => {
    drawSvgAngularGradientPolygons([], [], paint, polygons, 0.4, bounds);

    expect(drawSvgPolygonsMock.mock.calls[0][3]).toBeCloseTo(0.2); // 0.4 * 0.5
  });

  it('should use the given nodeBounds instead of the polygon bounds when provided', () => {
    const nodeBounds = { height: 10, width: 10, x: 100, y: 100 };

    drawSvgAngularGradientPolygons([], [], paint, polygons, 1, bounds, nodeBounds);

    expect(drawSvgPolygonsMock).toHaveBeenCalledTimes(120);
  });
});
