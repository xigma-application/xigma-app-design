// utils
import { drawSvgPaintPolygons } from '../drawSvgPaintPolygons';

const drawSvgGradientPolygonsMock = vi.fn();
const drawSvgImagePaintMock = vi.fn();

vi.mock('../drawSvgGradientPolygons', () => ({
  drawSvgGradientPolygons: (...args: unknown[]): void => drawSvgGradientPolygonsMock(...args),
}));
vi.mock('../drawSvgImagePaint', () => ({
  drawSvgImagePaint: (...args: unknown[]): Promise<void> => drawSvgImagePaintMock(...args),
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
    drawSvgImagePaintMock.mockClear();
    drawSvgImagePaintMock.mockResolvedValue(undefined);
  });

  it('should draw one visible solid paint with its opacity as a fraction', async () => {
    const elements: string[] = [];

    await drawSvgPaintPolygons(elements, [], [{ color: '#00ff00', opacity: 40, type: 'solid' }], polygons, 1, bounds);

    expect(elements).toHaveLength(1);
    expect(elements[0]).toContain('fill="#00ff00"');
    expect(elements[0]).toContain('fill-opacity="0.4"');
  });

  it('should skip hidden and unsupported (angular/diamond/pattern) paints and draw the rest bottom to top', async () => {
    const elements: string[] = [];

    await drawSvgPaintPolygons(
      elements,
      [],
      [
        { color: '#111111', opacity: 100, type: 'solid' },
        { color: '#222222', opacity: 100, type: 'solid', visible: false },
        { end: { x: 1, y: 0 }, opacity: 100, start: { x: 0, y: 0 }, stops: [], type: 'gradient-angular' },
        { end: { x: 1, y: 0 }, opacity: 100, start: { x: 0, y: 0 }, stops: [], type: 'gradient-diamond' },
        {
          alignmentIndex: 0,
          direction: 'horizontal',
          offsetX: 0,
          offsetY: 0,
          scale: 1,
          spacingX: 0,
          spacingY: 0,
          tileType: 'grid',
          type: 'pattern',
        },
        { color: '#333333', opacity: 100, type: 'solid' },
      ] as never,
      polygons,
      1,
      bounds,
    );

    expect(elements).toHaveLength(2);
    expect(elements[0]).toContain('fill="#333333"');
    expect(elements[1]).toContain('fill="#111111"');
    expect(drawSvgImagePaintMock).not.toHaveBeenCalled();
  });

  it('should multiply in the given opacity', async () => {
    const elements: string[] = [];

    await drawSvgPaintPolygons(elements, [], [{ color: '#ff0000', opacity: 100, type: 'solid' }], polygons, 0.5, bounds);

    expect(elements[0]).toContain('fill-opacity="0.5"');
  });

  it('should draw a gradient paint through drawSvgGradientPolygons with its opacity as a fraction', async () => {
    const elements: string[] = [];
    const defs: string[] = [];
    const gradient = { end: { x: 10, y: 0 }, opacity: 40, start: { x: 0, y: 0 }, stops: [], type: 'gradient-linear' as const };

    await drawSvgPaintPolygons(elements, defs, [gradient], polygons, 1, bounds);

    expect(elements).toEqual([]);
    expect(drawSvgGradientPolygonsMock).toHaveBeenCalledTimes(1);
    expect(drawSvgGradientPolygonsMock).toHaveBeenCalledWith(elements, defs, { ...gradient, opacity: 40 }, polygons, 0.4, bounds, null);
  });

  it('should forward a given node bounds through to a gradient paint', async () => {
    const elements: string[] = [];
    const defs: string[] = [];
    const gradient = { end: { x: 1, y: 0 }, opacity: 40, start: { x: 0, y: 0 }, stops: [], type: 'gradient-linear' as const };
    const nodeBounds = { height: 5, width: 5, x: 1, y: 1 };

    await drawSvgPaintPolygons(elements, defs, [gradient], polygons, 1, bounds, nodeBounds);

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

  it('should skip an image/video paint when no box geometry is given', async () => {
    const elements: string[] = [];
    const image = { opacity: 100, ref: 'i', rotation: 0, scaleMode: 'fill' as const, type: 'image' as const };

    await drawSvgPaintPolygons(elements, [], [image], polygons, 1, bounds);

    expect(elements).toEqual([]);
    expect(drawSvgImagePaintMock).not.toHaveBeenCalled();
  });

  it('should draw an image/video paint through drawSvgImagePaint, awaited, when a box geometry is given', async () => {
    const elements: string[] = [];
    const defs: string[] = [];
    const image = { opacity: 40, ref: 'i', rotation: 0, scaleMode: 'fill' as const, type: 'image' as const };
    const boxGeometry = { rect: { height: 10, width: 10, x: 0, y: 0 }, rotation: 0 };

    await drawSvgPaintPolygons(elements, defs, [image], polygons, 1, bounds, null, boxGeometry);

    expect(drawSvgImagePaintMock).toHaveBeenCalledWith(elements, defs, { ...image, opacity: 40 }, polygons, 0.4, bounds, boxGeometry);
  });
});
