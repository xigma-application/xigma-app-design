// utils
import { getAutoLayoutRotatedPositions } from '../getAutoLayoutRotatedPositions';

describe('getAutoLayoutRotatedPositions', () => {
  it('should leave every position untouched when there is no rotation', () => {
    // action
    const positions = getAutoLayoutRotatedPositions({ a: { x: 10, y: 20 } }, { a: { height: 10, width: 10 } }, { x: 0, y: 0 }, 0);

    // result
    expect(positions).toEqual({ a: { x: 10, y: 20 } });
  });

  it('should orbit each slot’s own centre around the given frame centre by the given rotation, keyed by id', () => {
    // mock — a zero-size "point" slot orbits exactly like a bare point would
    const sizesById = { a: { height: 0, width: 0 }, b: { height: 0, width: 0 } };

    // action — (10,0) orbiting (0,0) by 90deg lands at (0,10)
    const positions = getAutoLayoutRotatedPositions({ a: { x: 10, y: 0 }, b: { x: 0, y: 10 } }, sizesById, { x: 0, y: 0 }, 90);

    // result
    expect(positions.a.x).toBeCloseTo(0, 5);
    expect(positions.a.y).toBeCloseTo(10, 5);
    expect(positions.b.x).toBeCloseTo(-10, 5);
    expect(positions.b.y).toBeCloseTo(0, 5);
  });

  it('should leave a position untouched when it has no matching size entry', () => {
    // action
    const positions = getAutoLayoutRotatedPositions({ a: { x: 10, y: 0 } }, {}, { x: 0, y: 0 }, 90);

    // result
    expect(positions).toEqual({ a: { x: 10, y: 0 } });
  });
});
