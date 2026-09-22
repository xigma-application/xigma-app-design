// utils
import { drawSvgPaintPolygons } from '../drawSvgPaintPolygons';

const drawSvgGradientPolygonsMock = vi.fn();

vi.mock('../drawSvgGradientPolygons', () => ({
  drawSvgGradientPolygons: (...args: unknown[]): void => drawSvgGradientPolygonsMock(...args),
}));

const bounds = { height: 100, width: 100, x: 0, y: 0 };
const polygons = [
  [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    { x: 10, y: 10 },
  ],
];

describe('drawSvgPaintPolygons', () => {
  beforeEach(() => {
    drawSvgGradientPolygonsMock.mockClear();
  });

  it('should draw one visible solid paint with its opacity as a fraction', () => {
    const elements: string[] = [];

    drawSvgPaintPolygons(elements, [], [{ color: '#00ff00', opacity: 40, type: 'solid' }], polygons, 1, bounds);

    expect(elements).toHaveLength(1);
    expect(elements[0]).toContain('fill="#00ff00"');
    expect(elements[0]).toContain('fill-opacity="0.4"');
  });

  it('should skip hidden and unsupported paints and draw the rest bottom to top', () => {
    const elements: string[] = [];

    drawSvgPaintPolygons(
      elements,
      [],
      [
        { color: '#111111', opacity: 100, type: 'solid' },
        { color: '#222222', opacity: 100, type: 'solid', visible: false },
        { opacity: 100, ref: 'i', rotation: 0, scaleMode: 'fill', type: 'image' },
        { color: '#333333', opacity: 100, type: 'solid' },
      ],
      polygons,
      1,
      bounds,
    );

    expect(elements).toHaveLength(2);
    expect(elements[0]).toContain('fill="#333333"');
    expect(elements[1]).toContain('fill="#111111"');
  });

  it('should multiply in the given opacity', () => {
    const elements: string[] = [];

    drawSvgPaintPolygons(elements, [], [{ color: '#ff0000', opacity: 100, type: 'solid' }], polygons, 0.5, bounds);

    expect(elements[0]).toContain('fill-opacity="0.5"');
  });

  it('should draw a gradient paint through drawSvgGradientPolygons with its opacity as a fraction', () => {
    const elements: string[] = [];
    const defs: string[] = [];
    const gradient = { end: { x: 10, y: 0 }, opacity: 40, start: { x: 0, y: 0 }, stops: [], type: 'gradient-linear' as const };

    drawSvgPaintPolygons(elements, defs, [gradient], polygons, 1, bounds);

    expect(elements).toEqual([]);
    expect(drawSvgGradientPolygonsMock).toHaveBeenCalledTimes(1);
    expect(drawSvgGradientPolygonsMock).toHaveBeenCalledWith(elements, defs, { ...gradient, opacity: 40 }, polygons, 0.4, bounds, null);
  });

  it('should forward a given node bounds through to a gradient paint', () => {
    const elements: string[] = [];
    const defs: string[] = [];
    const gradient = { end: { x: 1, y: 0 }, opacity: 40, start: { x: 0, y: 0 }, stops: [], type: 'gradient-linear' as const };
    const nodeBounds = { height: 5, width: 5, x: 1, y: 1 };

    drawSvgPaintPolygons(elements, defs, [gradient], polygons, 1, bounds, nodeBounds);

    expect(drawSvgGradientPolygonsMock).toHaveBeenCalledWith(
      elements,
      defs,
      { ...gradient, opacity: 40 },
      polygons,
      0.4,
      bounds,
      nodeBounds,
    );
  });
});
