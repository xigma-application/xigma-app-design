// utils
import { getGradientStopValueLabelAnchor } from '../getGradientStopValueLabelAnchor';

const UP = { x: 0, y: -1 };

describe('getGradientStopValueLabelAnchor', () => {
  it('should anchor straight above the stop position at zoom 1, when the offset direction is up', () => {
    // before
    const { anchor, direction } = getGradientStopValueLabelAnchor({ x: 50, y: 50 }, UP, 1);

    // result
    expect(anchor.x).toBeCloseTo(50);
    expect(anchor.y).toBeCloseTo(40);
    expect(direction).toEqual(UP);
  });

  it('should scale the extra margin down as the viewport zooms in, so it stays a constant screen distance', () => {
    // before
    const zoomedOut = getGradientStopValueLabelAnchor({ x: 50, y: 50 }, UP, 1);
    const zoomedIn = getGradientStopValueLabelAnchor({ x: 50, y: 50 }, UP, 2);

    // result — at 2x zoom, the same screen distance is half the world distance, so the anchor sits closer
    expect(zoomedOut.anchor.y).toBeLessThan(zoomedIn.anchor.y);
  });

  it('should never move the anchor horizontally when the offset direction is straight up', () => {
    // before
    const { anchor } = getGradientStopValueLabelAnchor({ x: 123, y: 45 }, UP, 1);

    // result
    expect(anchor.x).toBe(123);
  });

  it('should offset sideways when the given direction points sideways, matching a vertical gradient line', () => {
    // before
    const { anchor, direction } = getGradientStopValueLabelAnchor({ x: 50, y: 50 }, { x: 1, y: 0 }, 1);

    // result
    expect(anchor.x).toBeCloseTo(60);
    expect(anchor.y).toBeCloseTo(50);
    expect(direction).toEqual({ x: 1, y: 0 });
  });
});
