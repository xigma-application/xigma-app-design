// utils
import { getPolylinePointAtLength } from '../getPolylinePointAtLength';

const polyline = [
  { x: 0, y: 0 },
  { x: 10, y: 0 },
  { x: 10, y: 0 },
  { x: 10, y: 10 },
];

describe('getPolylinePointAtLength', () => {
  it('should find the point and segment at a distance along the polyline, skipping empty segments', () => {
    // result
    expect(getPolylinePointAtLength(polyline, 4)).toEqual({ index: 0, point: { x: 4, y: 0 } });
    expect(getPolylinePointAtLength(polyline, 15)).toEqual({ index: 2, point: { x: 10, y: 5 } });
  });

  it('should stop at the last point past the end', () => {
    // result
    expect(getPolylinePointAtLength(polyline, 50)).toEqual({ index: 3, point: { x: 10, y: 10 } });
  });
});
