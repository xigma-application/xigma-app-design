// utils
import { getAutoLayoutFrameCenter } from '../getAutoLayoutFrameCenter';

describe('getAutoLayoutFrameCenter', () => {
  it('should return the midpoint of the frame’s own box', () => {
    // action
    const center = getAutoLayoutFrameCenter({ height: 100, width: 200, x: 10, y: 20 });

    // result
    expect(center).toEqual({ x: 110, y: 70 });
  });
});
