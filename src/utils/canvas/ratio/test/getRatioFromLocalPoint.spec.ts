// utils
import { getRatioFromLocalPoint } from '../getRatioFromLocalPoint';

const CENTER = { x: 50, y: 50 };
const ANCHOR = { x: 79.38926261462366, y: 9.54915028125263 };
const MIN = 0.001;
const MAX = 1;

describe('getRatioFromLocalPoint', () => {
  it('should return the max ratio when the point sits exactly on the anchor', () => {
    // result
    expect(getRatioFromLocalPoint(ANCHOR, CENTER, ANCHOR, MIN, MAX)).toBeCloseTo(1, 6);
  });

  it('should return the min ratio when the point sits exactly on the center', () => {
    // result
    expect(getRatioFromLocalPoint(CENTER, CENTER, ANCHOR, MIN, MAX)).toBeCloseTo(MIN, 6);
  });

  it('should return a proportional ratio for a point halfway between center and anchor', () => {
    // mock
    const halfPoint = { x: CENTER.x + (ANCHOR.x - CENTER.x) * 0.5, y: CENTER.y + (ANCHOR.y - CENTER.y) * 0.5 };

    // result
    expect(getRatioFromLocalPoint(halfPoint, CENTER, ANCHOR, MIN, MAX)).toBeCloseTo(0.5, 6);
  });

  it('should clamp to the max ratio once the point overshoots past the anchor', () => {
    // mock
    const beyondPoint = { x: CENTER.x + (ANCHOR.x - CENTER.x) * 1.5, y: CENTER.y + (ANCHOR.y - CENTER.y) * 1.5 };

    // result
    expect(getRatioFromLocalPoint(beyondPoint, CENTER, ANCHOR, MIN, MAX)).toBe(MAX);
  });

  it('should clamp to the min ratio once the point crosses past the center, away from the anchor', () => {
    // mock
    const pastCenterPoint = { x: CENTER.x - (ANCHOR.x - CENTER.x), y: CENTER.y - (ANCHOR.y - CENTER.y) };

    // result
    expect(getRatioFromLocalPoint(pastCenterPoint, CENTER, ANCHOR, MIN, MAX)).toBe(MIN);
  });
});
