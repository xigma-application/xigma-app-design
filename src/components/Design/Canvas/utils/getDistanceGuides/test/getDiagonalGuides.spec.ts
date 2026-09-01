// utils
import { getDiagonalGuides } from '../getDiagonalGuides';

describe('getDiagonalGuides', () => {
  it('should draw two solid measurement lines plus a dashed corner bracket when the target sits below-right', () => {
    const active = { bottom: 100, left: 0, right: 100, top: 0 };
    const target = { bottom: 340, left: 200, right: 250, top: 300 };

    const guides = getDiagonalGuides(active, target, { height: 100, width: 100, x: 0, y: 0 });

    expect(guides.lines).toEqual([
      { dashed: false, x1: 100, x2: 200, y1: 50, y2: 50 },
      { dashed: false, x1: 50, x2: 50, y1: 100, y2: 300 },
      { dashed: true, x1: 200, x2: 200, y1: 50, y2: 300 },
      { dashed: true, x1: 50, x2: 200, y1: 300, y2: 300 },
    ]);
    expect(guides.labels).toEqual([
      { anchor: { x: 150, y: 50 }, offsetDirection: { x: 0, y: 1 }, text: '100' },
      { anchor: { x: 50, y: 200 }, offsetDirection: { x: -1, y: 0 }, text: '200' },
    ]);
  });

  it('should mirror the bracket when the target sits above-left', () => {
    const active = { bottom: 340, left: 200, right: 250, top: 300 };
    const target = { bottom: 100, left: 0, right: 100, top: 0 };

    const guides = getDiagonalGuides(active, target, { height: 40, width: 50, x: 200, y: 300 });

    expect(guides.lines).toEqual([
      { dashed: false, x1: 100, x2: 200, y1: 320, y2: 320 },
      { dashed: false, x1: 225, x2: 225, y1: 100, y2: 300 },
      { dashed: true, x1: 100, x2: 100, y1: 320, y2: 100 },
      { dashed: true, x1: 225, x2: 100, y1: 100, y2: 100 },
    ]);
  });

  it('should never report a negative measurement, and should keep the dashed bracket consistent with the solid line it closes, when the pair sits diagonally but their ranges also overlap on one axis (regression)', () => {
    // before — active (selected, below-right) and target (hovered, above-left) whose y-ranges
    // genuinely overlap (active.top=235 sits inside target's own 60..290 span), so neither is
    // cleanly above the other
    const active = { bottom: 435, left: 685, right: 890, top: 235 };
    const target = { bottom: 290, left: 88, right: 440, top: 60 };

    const guides = getDiagonalGuides(active, target, { height: 200, width: 205, x: 685, y: 235 });

    // result — the vertical measurement now spans target's top (60) to active's top (235): a
    // real, non-negative span, instead of the previous inverted (target.bottom, active.top) pair;
    // the dashed bracket's horizontal leg closes at that same y=60 (target's top), not the stale
    // y=290 (target's bottom) the old, independently-computed targetFacingY used to point at
    expect(guides.lines).toEqual([
      { dashed: false, x1: 440, x2: 685, y1: 335, y2: 335 },
      { dashed: false, x1: 787.5, x2: 787.5, y1: 60, y2: 235 },
      { dashed: true, x1: 440, x2: 440, y1: 335, y2: 60 },
      { dashed: true, x1: 787.5, x2: 440, y1: 60, y2: 60 },
    ]);
    expect(guides.labels[1]).toEqual({ anchor: { x: 787.5, y: 147.5 }, offsetDirection: { x: -1, y: 0 }, text: '175' });
    expect(guides.labels.some((label) => label.text.startsWith('-'))).toBe(false);
  });
});
