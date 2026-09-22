// utils
import { drawSvgPaintPolygons } from '../drawSvgPaintPolygons';

const bounds = { height: 100, width: 100, x: 0, y: 0 };
const polygons = [
  [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    { x: 10, y: 10 },
  ],
];

describe('drawSvgPaintPolygons', () => {
  it('should draw one visible solid paint with its opacity as a fraction', () => {
    const elements: string[] = [];

    drawSvgPaintPolygons(elements, [{ color: '#00ff00', opacity: 40, type: 'solid' }], polygons, 1, bounds);

    expect(elements).toHaveLength(1);
    expect(elements[0]).toContain('fill="#00ff00"');
    expect(elements[0]).toContain('fill-opacity="0.4"');
  });

  it('should skip hidden and non-solid paints and draw the rest bottom to top', () => {
    const elements: string[] = [];

    drawSvgPaintPolygons(
      elements,
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

    drawSvgPaintPolygons(elements, [{ color: '#ff0000', opacity: 100, type: 'solid' }], polygons, 0.5, bounds);

    expect(elements[0]).toContain('fill-opacity="0.5"');
  });
});
