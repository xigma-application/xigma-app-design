// utils
import { getBooleanFacePoint } from '../getBooleanFacePoint';

vi.mock('../../vectorNetwork/buildVectorNodeFromLoops/assembleVectorNodeFromLoopGeometries/getPointInsideFace', () => ({
  getPointInsideFace: (): { x: number; y: number } => ({ x: -1, y: -1 }),
}));

const square = [
  { x: 0, y: 10 },
  { x: 0, y: 0 },
  { x: 100, y: 0 },
  { x: 100, y: 10 },
];

describe('getBooleanFacePoint', () => {
  it('should sample just inside the middle of the longest edge, whichever way the face winds', () => {
    // before
    const clockwise = getBooleanFacePoint(square);
    const counterClockwise = getBooleanFacePoint([...square].reverse());

    // result
    [clockwise, counterClockwise].forEach((point) => {
      expect(point.x).toBeCloseTo(50);
      expect(point.y).toBeGreaterThan(0);
      expect(point.y).toBeLessThan(1);
    });
  });

  it('should fall back to a generic inside point for a degenerate face', () => {
    // before
    const point = getBooleanFacePoint([
      { x: 5, y: 5 },
      { x: 5, y: 5 },
      { x: 5, y: 5 },
    ]);

    // result
    expect(point).toEqual({ x: -1, y: -1 });
  });
});
