// utils
import { getGradientStopValueLabelAnchor } from '../getGradientStopValueLabelAnchor';

describe('getGradientStopValueLabelAnchor', () => {
  it('should anchor straight above the stop position at zoom 1', () => {
    // before
    const { anchor, direction } = getGradientStopValueLabelAnchor({ x: 50, y: 50 }, 1);

    // result
    expect(anchor.x).toBeCloseTo(50);
    expect(anchor.y).toBeCloseTo(40);
    expect(direction).toEqual({ x: 0, y: -1 });
  });

  it('should scale the extra margin down as the viewport zooms in, so it stays a constant screen distance', () => {
    // before
    const zoomedOut = getGradientStopValueLabelAnchor({ x: 50, y: 50 }, 1);
    const zoomedIn = getGradientStopValueLabelAnchor({ x: 50, y: 50 }, 2);

    // result — at 2x zoom, the same screen distance is half the world distance, so the anchor sits closer
    expect(zoomedOut.anchor.y).toBeLessThan(zoomedIn.anchor.y);
  });

  it('should never move the anchor horizontally', () => {
    // before
    const { anchor } = getGradientStopValueLabelAnchor({ x: 123, y: 45 }, 1);

    // result
    expect(anchor.x).toBe(123);
  });
});
