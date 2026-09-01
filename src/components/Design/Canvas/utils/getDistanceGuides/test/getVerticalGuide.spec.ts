// utils
import { getVerticalGuide } from '../getVerticalGuide';

describe('getVerticalGuide', () => {
  it('should measure from the active rect to the target when the target sits below', () => {
    // before
    const { label, line } = getVerticalGuide(
      { bottom: 100, left: 0, right: 100, top: 0 },
      { bottom: 230, left: 20, right: 80, top: 150 },
      50,
    );

    // result
    expect(line).toEqual({ dashed: false, x1: 50, x2: 50, y1: 100, y2: 150 });
    expect(label).toEqual({ anchor: { x: 50, y: 125 }, offsetDirection: { x: -1, y: 0 }, text: '50' });
  });

  it('should measure from the target to the active rect when the target sits above', () => {
    // before
    const { label, line } = getVerticalGuide(
      { bottom: 250, left: 0, right: 100, top: 150 },
      { bottom: 80, left: 20, right: 80, top: 0 },
      50,
    );

    // result
    expect(line).toEqual({ dashed: false, x1: 50, x2: 50, y1: 80, y2: 150 });
    expect(label).toEqual({ anchor: { x: 50, y: 115 }, offsetDirection: { x: -1, y: 0 }, text: '70' });
  });

  it("should compare the two rects' own top edges — never a negative span — when their y-ranges genuinely overlap and target is the upper one (e.g. a diagonal pair)", () => {
    // before — active sits below-right of target with a real y overlap (neither is cleanly
    // above the other): active top=235 sits inside target's own span (60..290), so the naive
    // near-edge pairing (target.bottom=290, active.top=235) would invert into a negative span
    const { label, line, targetY } = getVerticalGuide(
      { bottom: 435, left: 685, right: 890, top: 235 },
      { bottom: 290, left: 88, right: 440, top: 60 },
      787,
    );

    // result — falls back to comparing top edges, always giving a real, non-negative span, and
    // exposes target's own edge (its top here) so the diagonal bracket can stay consistent with it
    expect(line).toEqual({ dashed: false, x1: 787, x2: 787, y1: 60, y2: 235 });
    expect(label).toEqual({ anchor: { x: 787, y: 147.5 }, offsetDirection: { x: -1, y: 0 }, text: '175' });
    expect(targetY).toBe(60);
  });

  it("should compare the two rects' own bottom edges when their y-ranges genuinely overlap and target is the lower one", () => {
    // before — the mirror of the case above: target now sits below active overall
    const { line, targetY } = getVerticalGuide(
      { bottom: 290, left: 88, right: 440, top: 60 },
      { bottom: 435, left: 685, right: 890, top: 235 },
      787,
    );

    // result
    expect(line).toEqual({ dashed: false, x1: 787, x2: 787, y1: 290, y2: 435 });
    expect(targetY).toBe(435);
  });
});
