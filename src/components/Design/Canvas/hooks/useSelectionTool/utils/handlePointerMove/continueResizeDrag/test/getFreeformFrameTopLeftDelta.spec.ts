// utils
import { getFreeformFrameTopLeftDelta } from '../getFreeformFrameTopLeftDelta';

describe('getFreeformFrameTopLeftDelta', () => {
  const origin = { height: 200, rotation: 0, width: 300, x: 100, y: 100 };

  it('should return a zero delta when the right edge moves (width grows, x/y unchanged)', () => {
    expect(getFreeformFrameTopLeftDelta(origin, { ...origin, width: 360 })).toEqual({ x: 0, y: 0 });
  });

  it('should return a zero delta when the bottom edge moves (height grows, x/y unchanged)', () => {
    expect(getFreeformFrameTopLeftDelta(origin, { ...origin, height: 260 })).toEqual({ x: 0, y: 0 });
  });

  it('should follow the left edge on the x axis only', () => {
    // left handle dragged 40px left: x -= 40, width += 40
    expect(getFreeformFrameTopLeftDelta(origin, { ...origin, width: 340, x: 60 })).toEqual({ x: -40, y: 0 });
  });

  it('should follow the top edge on the y axis only', () => {
    expect(getFreeformFrameTopLeftDelta(origin, { ...origin, height: 250, y: 50 })).toEqual({ x: 0, y: -50 });
  });

  it('should combine both axes for a top-left corner drag', () => {
    expect(getFreeformFrameTopLeftDelta(origin, { ...origin, height: 250, width: 340, x: 60, y: 50 })).toEqual({ x: -40, y: -50 });
  });

  describe('rotated frame', () => {
    const rotated = { height: 200, rotation: 90, width: 300, x: 100, y: 100 };

    it('should stay zero when the resize keeps the local top-left corner anchored', () => {
      // widening a 90deg frame while holding its local top-left corner fixed in world space
      const delta = getFreeformFrameTopLeftDelta(rotated, { height: 200, rotation: 90, width: 360, x: 70, y: 130 });

      expect(delta.x).toBeCloseTo(0);
      expect(delta.y).toBeCloseTo(0);
    });

    it('should equal a whole-frame translation regardless of rotation', () => {
      const delta = getFreeformFrameTopLeftDelta(rotated, { ...rotated, x: 130, y: 160 });

      expect(delta.x).toBeCloseTo(30);
      expect(delta.y).toBeCloseTo(60);
    });
  });
});
