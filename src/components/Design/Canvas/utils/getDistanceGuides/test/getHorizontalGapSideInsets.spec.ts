// utils
import { getHorizontalGapSideInsets } from '../getHorizontalGapSideInsets';

describe('getHorizontalGapSideInsets', () => {
  it('should measure each side when the horizontal ranges overlap but the heights differ', () => {
    // before — the transpose of getVerticalGapSideInsets: target sits to the right, shorter than active
    const active = { bottom: 100, left: 0, right: 100, top: 0 };
    const target = { bottom: 80, left: 150, right: 230, top: 20 };

    const insets = getHorizontalGapSideInsets(active, target, { height: 100, width: 100, x: 0, y: 0 });

    expect(insets.lines).toEqual([
      { dashed: true, x1: 0, x2: 150, y1: 20, y2: 20 },
      { dashed: false, x1: 50, x2: 50, y1: 0, y2: 20 },
      { dashed: true, x1: 0, x2: 150, y1: 80, y2: 80 },
      { dashed: false, x1: 50, x2: 50, y1: 80, y2: 100 },
    ]);
    expect(insets.labels).toEqual([
      { anchor: { x: 50, y: 10 }, offsetDirection: { x: -1, y: 0 }, text: '20' },
      { anchor: { x: 50, y: 90 }, offsetDirection: { x: -1, y: 0 }, text: '20' },
    ]);
  });

  it('should measure each side when the target sits to the left of the active rect', () => {
    // before — active is on the right, target (shorter) sits to its left; the dashed guides now run
    // from the active rect's own right edge, leftward through it, through the gap, to the target's
    // near (right) edge
    const active = { bottom: 100, left: 150, right: 250, top: 0 };
    const target = { bottom: 80, left: 0, right: 80, top: 20 };

    const insets = getHorizontalGapSideInsets(active, target, { height: 100, width: 100, x: 150, y: 0 });

    expect(insets.lines).toEqual([
      { dashed: true, x1: 250, x2: 80, y1: 20, y2: 20 },
      { dashed: false, x1: 200, x2: 200, y1: 0, y2: 20 },
      { dashed: true, x1: 250, x2: 80, y1: 80, y2: 80 },
      { dashed: false, x1: 200, x2: 200, y1: 80, y2: 100 },
    ]);
  });

  it('should omit a side that is already flush between the two rects', () => {
    // before — top edges match, only the bottom side is inset
    const active = { bottom: 100, left: 0, right: 100, top: 0 };
    const target = { bottom: 60, left: 150, right: 230, top: 0 };

    const insets = getHorizontalGapSideInsets(active, target, { height: 100, width: 100, x: 0, y: 0 });

    expect(insets.lines.filter((line) => line.dashed)).toEqual([{ dashed: true, x1: 0, x2: 150, y1: 60, y2: 60 }]);
  });
});
