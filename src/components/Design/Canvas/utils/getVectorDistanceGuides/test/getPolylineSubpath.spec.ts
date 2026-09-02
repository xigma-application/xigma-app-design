// utils
import { getPolylineSubpath } from '../getPolylineSubpath';

describe('getPolylineSubpath', () => {
  const straight = [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
  ];
  const bent = [
    { x: 0, y: 0 },
    { x: 0, y: 100 },
    { x: 100, y: 100 },
  ];

  it('should return foot-to-start and foot-to-end slices of a straight polyline', () => {
    expect(getPolylineSubpath(straight, { x: 40, y: 0 }, 40, 'start')).toEqual([
      { x: 40, y: 0 },
      { x: 0, y: 0 },
    ]);
    expect(getPolylineSubpath(straight, { x: 40, y: 0 }, 40, 'end')).toEqual([
      { x: 40, y: 0 },
      { x: 100, y: 0 },
    ]);
  });

  it('should keep the bends between the foot and the requested end', () => {
    expect(getPolylineSubpath(bent, { x: 50, y: 100 }, 150, 'start')).toEqual([
      { x: 50, y: 100 },
      { x: 0, y: 100 },
      { x: 0, y: 0 },
    ]);
    expect(getPolylineSubpath(bent, { x: 50, y: 100 }, 150, 'end')).toEqual([
      { x: 50, y: 100 },
      { x: 100, y: 100 },
    ]);
  });

  it('should include a bend that lies on the foot-to-end side when the foot is on the first edge', () => {
    expect(getPolylineSubpath(bent, { x: 0, y: 40 }, 40, 'end')).toEqual([
      { x: 0, y: 40 },
      { x: 0, y: 100 },
      { x: 100, y: 100 },
    ]);
    expect(getPolylineSubpath(bent, { x: 0, y: 40 }, 40, 'start')).toEqual([
      { x: 0, y: 40 },
      { x: 0, y: 0 },
    ]);
  });
});
