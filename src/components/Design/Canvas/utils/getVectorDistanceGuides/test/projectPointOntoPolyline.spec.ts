// utils
import { projectPointOntoPolyline } from '../projectPointOntoPolyline';

describe('projectPointOntoPolyline', () => {
  const straight = [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
  ];

  it('should drop a perpendicular onto an interior point of a straight polyline', () => {
    const result = projectPointOntoPolyline({ x: 40, y: 10 }, straight);

    expect(result).toEqual({ atEndpoint: null, foot: { x: 40, y: 0 }, lengthFromStart: 40, perpDistance: 10, totalLength: 100 });
  });

  it('should clamp to the start when the foot falls before the polyline', () => {
    const result = projectPointOntoPolyline({ x: -5, y: 10 }, straight);

    expect(result.atEndpoint).toBe('start');
    expect(result.foot).toEqual({ x: 0, y: 0 });
    expect(result.lengthFromStart).toBe(0);
  });

  it('should clamp to the end when the foot falls past the polyline', () => {
    const result = projectPointOntoPolyline({ x: 200, y: 10 }, straight);

    expect(result.atEndpoint).toBe('end');
    expect(result.foot).toEqual({ x: 100, y: 0 });
    expect(result.lengthFromStart).toBe(100);
  });

  it('should skip a zero-length edge and still measure along the rest', () => {
    const withDuplicate = [
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 50, y: 0 },
    ];

    const result = projectPointOntoPolyline({ x: 10, y: 5 }, withDuplicate);

    expect(result).toEqual({ atEndpoint: null, foot: { x: 10, y: 0 }, lengthFromStart: 10, perpDistance: 5, totalLength: 50 });
  });

  it('should pick the nearer edge of a bent polyline', () => {
    const bent = [
      { x: 0, y: 0 },
      { x: 0, y: 100 },
      { x: 100, y: 100 },
    ];

    const result = projectPointOntoPolyline({ x: 10, y: 40 }, bent);

    expect(result.foot).toEqual({ x: 0, y: 40 });
    expect(result.lengthFromStart).toBe(40);
    expect(result.totalLength).toBe(200);
  });
});
