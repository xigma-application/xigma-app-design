// utils
import { getMediaPlacementRect } from '../getMediaPlacementRect';

describe('getMediaPlacementRect', () => {
  it('should center the natural-size rect on the start point for a plain click', () => {
    // action
    const rect = getMediaPlacementRect(true, { x: 10, y: 10 }, { x: 10, y: 10 }, 200, 100);

    // result
    expect(rect).toEqual({ height: 100, width: 200, x: -90, y: -40 });
  });

  it('should lock the dragged rect to the aspect ratio when it is not a click', () => {
    // action
    const rect = getMediaPlacementRect(false, { x: 0, y: 0 }, { x: 50, y: 50 }, 200, 100);

    // result — the raw 50x50 drag does not match the 2:1 source ratio, so it must be locked
    expect(rect).toEqual({ height: 50, width: 100, x: 0, y: 0 });
  });
});
