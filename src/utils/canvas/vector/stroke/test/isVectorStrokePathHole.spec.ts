// utils
import { isVectorStrokePathHole } from '../isVectorStrokePathHole';

const outer = {
  closed: true,
  points: [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    { x: 100, y: 100 },
    { x: 0, y: 100 },
  ],
};
const inner = {
  closed: true,
  points: [
    { x: 25, y: 25 },
    { x: 75, y: 25 },
    { x: 75, y: 75 },
    { x: 25, y: 75 },
  ],
};

describe('isVectorStrokePathHole', () => {
  it('should treat a closed path inside another as a hole', () => {
    // result
    expect(isVectorStrokePathHole(inner, [outer, inner])).toBe(true);
  });

  it('should not treat the outer closed path as a hole', () => {
    // result
    expect(isVectorStrokePathHole(outer, [outer, inner])).toBe(false);
  });

  it('should never treat an open path as a hole', () => {
    // mock
    const open = { closed: false, points: inner.points };

    // result
    expect(isVectorStrokePathHole(open, [outer, open])).toBe(false);
  });
});
