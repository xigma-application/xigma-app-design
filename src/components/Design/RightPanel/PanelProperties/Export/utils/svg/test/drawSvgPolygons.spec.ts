// utils
import { drawSvgPolygons } from '../drawSvgPolygons';

const bounds = { height: 100, width: 100, x: 0, y: 0 };

describe('drawSvgPolygons', () => {
  it('should push one path element with the fill color and no fill-opacity attribute at full opacity', () => {
    const elements: string[] = [];
    const polygon = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
    ];

    drawSvgPolygons(elements, [polygon], '#ff0000', 1, bounds);

    expect(elements).toEqual(['<path d="M0 0 L10 0 L10 10 Z" fill="#ff0000" fill-rule="evenodd"/>']);
  });

  it('should include a fill-opacity attribute below full opacity', () => {
    const elements: string[] = [];
    const polygon = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
    ];

    drawSvgPolygons(elements, [polygon], '#ff0000', 0.5, bounds);

    expect(elements).toEqual(['<path d="M0 0 L10 0 L10 10 Z" fill="#ff0000" fill-opacity="0.5" fill-rule="evenodd"/>']);
  });

  it('should use the nonzero fill rule when given', () => {
    const elements: string[] = [];
    const polygon = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
    ];

    drawSvgPolygons(elements, [polygon], '#ff0000', 1, bounds, 'nonzero');

    expect(elements[0]).toContain('fill-rule="nonzero"');
  });

  it('should push nothing when every polygon is degenerate', () => {
    const elements: string[] = [];

    drawSvgPolygons(elements, [[{ x: 0, y: 0 }]], '#ff0000', 1, bounds);

    expect(elements).toEqual([]);
  });
});
