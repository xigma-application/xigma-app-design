// utils
import { getClosestPointOnLine } from '../getClosestPointOnLine';

describe('getClosestPointOnLine', () => {
  it('should return the perpendicular projection when it falls within the line segment', () => {
    // action
    const closest = getClosestPointOnLine({ x: 5, y: 2 }, { x1: 0, x2: 10, y1: 0, y2: 0 });

    // result
    expect(closest).toEqual({ x: 5, y: 0 });
  });

  it('should clamp to the start endpoint when the projection falls before it', () => {
    // action
    const closest = getClosestPointOnLine({ x: -5, y: 5 }, { x1: 0, x2: 10, y1: 0, y2: 0 });

    // result
    expect(closest).toEqual({ x: 0, y: 0 });
  });

  it('should clamp to the end endpoint when the projection falls beyond it', () => {
    // action
    const closest = getClosestPointOnLine({ x: 15, y: 5 }, { x1: 0, x2: 10, y1: 0, y2: 0 });

    // result
    expect(closest).toEqual({ x: 10, y: 0 });
  });

  it('should return the shared point when the line has zero length', () => {
    // action
    const closest = getClosestPointOnLine({ x: 5, y: 5 }, { x1: 3, x2: 3, y1: 3, y2: 3 });

    // result
    expect(closest).toEqual({ x: 3, y: 3 });
  });
});
