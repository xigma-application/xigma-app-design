// utils
import { getStripFrame } from '../getStripFrame';

const centerline = {
  points: [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    { x: 20, y: 0 },
  ],
  tangents: [
    { x: 1, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 0 },
  ],
};

describe('getStripFrame', () => {
  it('should sit on the centre line at the arc length with the normal turned a quarter', () => {
    // action
    const frame = getStripFrame(centerline, [0, 10, 20], 15);

    // result
    expect(frame.x).toBeCloseTo(15);
    expect(frame.y).toBeCloseTo(0);
    expect(frame.normal.x).toBeCloseTo(0);
    expect(frame.normal.y).toBeCloseTo(1);
  });

  it('should clamp to the ends of the line', () => {
    // result
    expect(getStripFrame(centerline, [0, 10, 20], 99).x).toBeCloseTo(20);
    expect(getStripFrame(centerline, [0, 10, 20], 0).x).toBeCloseTo(0);
  });
});
