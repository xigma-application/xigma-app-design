// utils
import { getVerticalGapSideInsets } from '../getVerticalGapSideInsets';

describe('getVerticalGapSideInsets', () => {
  it("should measure each side's inset when the target is narrower than the active rect, directly below it", () => {
    // before — active is selected (0..100 wide), target is a narrower 60-wide rect centered under it
    const active = { bottom: 100, left: 0, right: 100, top: 0 };
    const target = { bottom: 230, left: 20, right: 80, top: 150 };

    // result — a dashed guide down each side of the active rect (extended from its own top, through
    // the gap, down to the target's near edge) and a solid inset tick at the active rect's own
    // vertical center on each side
    const insets = getVerticalGapSideInsets(active, target, { height: 100, width: 100, x: 0, y: 0 });

    expect(insets.lines).toEqual([
      { dashed: true, x1: 20, x2: 20, y1: 0, y2: 150 },
      { dashed: false, x1: 0, x2: 20, y1: 50, y2: 50 },
      { dashed: true, x1: 80, x2: 80, y1: 0, y2: 150 },
      { dashed: false, x1: 80, x2: 100, y1: 50, y2: 50 },
    ]);
    expect(insets.labels).toEqual([
      { anchor: { x: 10, y: 50 }, offsetDirection: { x: 0, y: 1 }, text: '20' },
      { anchor: { x: 90, y: 50 }, offsetDirection: { x: 0, y: 1 }, text: '20' },
    ]);
  });

  it('should measure each side when the active rect is narrower than the target, directly above it', () => {
    // before — active (selected, narrower) sits above a wider target; the dashed guides now run
    // from the active rect's own top, through it, through the gap, down to the target's near (top)
    // edge, and the inset tick still sits at the active rect's own center
    const active = { bottom: 80, left: 20, right: 80, top: 0 };
    const target = { bottom: 250, left: 0, right: 100, top: 150 };

    const insets = getVerticalGapSideInsets(active, target, { height: 80, width: 60, x: 20, y: 0 });

    expect(insets.lines).toEqual([
      { dashed: true, x1: 0, x2: 0, y1: 0, y2: 150 },
      { dashed: false, x1: 0, x2: 20, y1: 40, y2: 40 },
      { dashed: true, x1: 100, x2: 100, y1: 0, y2: 150 },
      { dashed: false, x1: 80, x2: 100, y1: 40, y2: 40 },
    ]);
  });

  it('should measure each side when the target sits above the active rect', () => {
    // before — active is below, target (narrower) sits above it; the dashed guides now run from the
    // active rect's own bottom, up through it, through the gap, up to the target's near (bottom) edge
    const active = { bottom: 250, left: 0, right: 100, top: 150 };
    const target = { bottom: 80, left: 20, right: 80, top: 0 };

    const insets = getVerticalGapSideInsets(active, target, { height: 100, width: 100, x: 0, y: 150 });

    expect(insets.lines).toEqual([
      { dashed: true, x1: 20, x2: 20, y1: 250, y2: 80 },
      { dashed: false, x1: 0, x2: 20, y1: 200, y2: 200 },
      { dashed: true, x1: 80, x2: 80, y1: 250, y2: 80 },
      { dashed: false, x1: 80, x2: 100, y1: 200, y2: 200 },
    ]);
  });

  it('should omit a side that is already flush between the two rects', () => {
    // before — left edges match, only the right side is inset
    const active = { bottom: 100, left: 0, right: 100, top: 0 };
    const target = { bottom: 230, left: 0, right: 60, top: 150 };

    const insets = getVerticalGapSideInsets(active, target, { height: 100, width: 100, x: 0, y: 0 });

    expect(insets.lines.filter((line) => line.dashed)).toEqual([{ dashed: true, x1: 60, x2: 60, y1: 0, y2: 150 }]);
  });
});
