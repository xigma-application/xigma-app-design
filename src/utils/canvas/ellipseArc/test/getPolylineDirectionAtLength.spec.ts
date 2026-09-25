// utils
import { getPolylineDirectionAtLength } from '../getPolylineDirectionAtLength';

const polyline = [
  { x: 0, y: 0 },
  { x: 10, y: 0 },
  { x: 10, y: 10 },
];

describe('getPolylineDirectionAtLength', () => {
  it('should give the direction of the segment at a distance', () => {
    // result
    expect(getPolylineDirectionAtLength(polyline, 5)).toEqual({ x: 1, y: 0 });
    expect(getPolylineDirectionAtLength(polyline, 15)).toEqual({ x: 0, y: 1 });
  });

  it('should use the last segment at the very end', () => {
    // result
    expect(getPolylineDirectionAtLength(polyline, 20)).toEqual({ x: 0, y: 1 });
  });
});
