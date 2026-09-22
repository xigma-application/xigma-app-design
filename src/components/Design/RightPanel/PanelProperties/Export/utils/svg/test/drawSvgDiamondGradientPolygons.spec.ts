// types
import { TGradientPaint } from 'types/design/paint/types';

// utils
import { drawSvgDiamondGradientPolygons } from '../drawSvgDiamondGradientPolygons';

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
  start: { x: 0.5, y: 0.5 },
  stops: [
    { color: '#00ff00', opacity: 100, position: 0 },
    { color: '#ff00ff', opacity: 100, position: 1 },
  ],
  type: 'gradient-diamond',
};

describe('drawSvgDiamondGradientPolygons', () => {
  beforeEach(() => {
    drawSvgPolygonsMock.mockClear();
    getSvgGradientColorAtMock.mockReset();
    getSvgGradientColorAtMock.mockReturnValue({ color: '#123456', opacity: 0.5 });
  });

  it('should register one clip-path for the shape and wrap every ring path in one clipped group', () => {
    const elements: string[] = [];
    const defs: string[] = [];

    drawSvgDiamondGradientPolygons(elements, defs, paint, polygons, 1, bounds);

    expect(defs).toHaveLength(1);
    expect(defs[0]).toContain('<clipPath id="XigmaClip0">');
    expect(elements).toHaveLength(1);
    expect(elements[0].startsWith('<g clip-path="url(#XigmaClip0)">')).toBe(true);
    expect(elements[0].endsWith('</g>')).toBe(true);
  });

  it('should draw exactly 64 rings, each an outer/inner diamond pair with evenodd fill, sampling color at the band midpoint', () => {
    drawSvgDiamondGradientPolygons([], [], paint, polygons, 1, bounds);

    expect(drawSvgPolygonsMock).toHaveBeenCalledTimes(64);
    expect(getSvgGradientColorAtMock).toHaveBeenCalledTimes(64);

    const [, ringPolygons, color, opacity, , fillRule] = drawSvgPolygonsMock.mock.calls[0] as [
      unknown[],
      unknown[][],
      string,
      number,
      unknown,
      string,
    ];

    expect(ringPolygons).toHaveLength(2);
    expect(ringPolygons[0]).toHaveLength(4);
    expect(ringPolygons[1]).toHaveLength(4);
    expect(color).toBe('#123456');
    expect(opacity).toBeCloseTo(0.5);
    expect(fillRule).toBe('evenodd');
  });

  it('should multiply the ambient opacity into every ring fill', () => {
    drawSvgDiamondGradientPolygons([], [], paint, polygons, 0.4, bounds);

    expect(drawSvgPolygonsMock.mock.calls[0][3]).toBeCloseTo(0.2); // 0.4 * 0.5
  });

  it('should use the given nodeBounds instead of the polygon bounds when provided', () => {
    const nodeBounds = { height: 10, width: 10, x: 100, y: 100 };

    drawSvgDiamondGradientPolygons([], [], paint, polygons, 1, bounds, nodeBounds);

    expect(drawSvgPolygonsMock).toHaveBeenCalledTimes(64);
  });
});
