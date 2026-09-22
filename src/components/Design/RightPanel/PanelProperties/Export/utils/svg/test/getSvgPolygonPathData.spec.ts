// utils
import { getSvgPolygonPathData } from '../getSvgPolygonPathData';

const bounds = { height: 100, width: 100, x: 10, y: 20 };

describe('getSvgPolygonPathData', () => {
  it('should build a closed M/L/Z path per polygon, translated by the bounds origin', () => {
    const polygon = [
      { x: 10, y: 20 },
      { x: 30, y: 20 },
      { x: 30, y: 40 },
    ];

    expect(getSvgPolygonPathData([polygon], bounds)).toBe('M0 0 L20 0 L20 20 Z');
  });

  it('should join multiple polygons with a space', () => {
    const a = [
      { x: 10, y: 20 },
      { x: 20, y: 20 },
      { x: 20, y: 30 },
    ];
    const b = [
      { x: 40, y: 50 },
      { x: 50, y: 50 },
      { x: 50, y: 60 },
    ];

    expect(getSvgPolygonPathData([a, b], bounds)).toBe('M0 0 L10 0 L10 10 Z M30 30 L40 30 L40 40 Z');
  });

  it('should drop degenerate polygons with fewer than 3 points', () => {
    expect(getSvgPolygonPathData([[{ x: 0, y: 0 }]], bounds)).toBe('');
  });
});
