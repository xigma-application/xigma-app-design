// utils
import { getHorizontalGuide } from '../getHorizontalGuide';

describe('getHorizontalGuide', () => {
  it('should measure from the active rect to the target when the target sits to the right', () => {
    // before
    const { label, line } = getHorizontalGuide(
      { bottom: 100, left: 0, right: 100, top: 0 },
      { bottom: 80, left: 150, right: 230, top: 20 },
      50,
    );

    // result
    expect(line).toEqual({ dashed: false, x1: 100, x2: 150, y1: 50, y2: 50 });
    expect(label).toEqual({ anchor: { x: 125, y: 50 }, offsetDirection: { x: 0, y: 1 }, text: '50' });
  });

  it('should measure from the target to the active rect when the target sits to the left', () => {
    // before
    const { label, line } = getHorizontalGuide(
      { bottom: 100, left: 150, right: 250, top: 0 },
      { bottom: 80, left: 0, right: 80, top: 20 },
      50,
    );

    // result
    expect(line).toEqual({ dashed: false, x1: 80, x2: 150, y1: 50, y2: 50 });
    expect(label).toEqual({ anchor: { x: 115, y: 50 }, offsetDirection: { x: 0, y: 1 }, text: '70' });
  });

  it("should compare the two rects' own left edges — never a negative span — when their x-ranges genuinely overlap and target is the leftmost one (e.g. a diagonal pair)", () => {
    // before — active sits to the right with a real x overlap (neither is cleanly to one side):
    // the naive near-edge pairing would invert into a negative span
    const { label, line, targetX } = getHorizontalGuide(
      { bottom: 100, left: 200, right: 400, top: 0 },
      { bottom: 300, left: 100, right: 300, top: 200 },
      50,
    );

    // result — falls back to comparing left edges, always giving a real, non-negative span, and
    // exposes target's own edge (its left here) so the diagonal bracket can stay consistent with it
    expect(line).toEqual({ dashed: false, x1: 100, x2: 200, y1: 50, y2: 50 });
    expect(label).toEqual({ anchor: { x: 150, y: 50 }, offsetDirection: { x: 0, y: 1 }, text: '100' });
    expect(targetX).toBe(100);
  });

  it("should compare the two rects' own right edges when their x-ranges genuinely overlap and target is the rightmost one", () => {
    // before — the mirror of the case above: target now sits to the right of active overall
    const { line, targetX } = getHorizontalGuide(
      { bottom: 300, left: 100, right: 300, top: 200 },
      { bottom: 100, left: 200, right: 400, top: 0 },
      50,
    );

    // result
    expect(line).toEqual({ dashed: false, x1: 300, x2: 400, y1: 50, y2: 50 });
    expect(targetX).toBe(400);
  });
});
