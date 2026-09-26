// utils
import { getFillFrameFromPoints } from '../getFillFrameFromPoints';
import { rotatePoint } from 'utils/math/rotatePoint';

describe('getFillFrameFromPoints', () => {
  it('should find the turned rectangle around a turned shape, centred on its own middle', () => {
    // mock — a 200x100 rectangle turned 30deg around (0, 0)
    const points = [
      { x: 0, y: 0 },
      { x: 200, y: 0 },
      { x: 200, y: 100 },
      { x: 0, y: 100 },
    ].map((point) => rotatePoint(point, { x: 0, y: 0 }, 30));

    // before
    const frame = getFillFrameFromPoints(points, 30);
    const middle = rotatePoint({ x: 100, y: 50 }, { x: 0, y: 0 }, 30);

    // result
    expect(frame.degrees).toBe(30);
    expect(frame.localBounds.width).toBeCloseTo(200);
    expect(frame.localBounds.height).toBeCloseTo(100);
    expect(frame.center.x).toBeCloseTo(middle.x);
    expect(frame.center.y).toBeCloseTo(middle.y);
    expect(frame.localBounds.x + frame.localBounds.width / 2).toBeCloseTo(middle.x);
  });
});
