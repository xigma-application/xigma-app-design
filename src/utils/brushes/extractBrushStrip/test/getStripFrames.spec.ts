// utils
import { getStripFrames } from '../getStripFrames';

const centerline = {
  points: [
    { x: 0, y: 0 },
    { x: 20, y: 0 },
  ],
  tangents: [
    { x: 1, y: 0 },
    { x: 1, y: 0 },
  ],
};

describe('getStripFrames', () => {
  it('should make one frame per pixel of arc length', () => {
    // action
    const frames = getStripFrames(centerline, [0, 20]);

    // result
    expect(frames).toHaveLength(20);
    expect(frames[5].x).toBeCloseTo(5);
  });

  it('should make at least two frames for a very short line', () => {
    // result
    expect(getStripFrames(centerline, [0, 0.4])).toHaveLength(2);
  });
});
