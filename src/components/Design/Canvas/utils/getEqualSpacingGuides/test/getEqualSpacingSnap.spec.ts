// utils
import { getEqualSpacingSnap } from '../getEqualSpacingSnap';

describe('getEqualSpacingSnap', () => {
  it('should return a zero delta and empty guides when there are no candidates', () => {
    // action
    const snap = getEqualSpacingSnap({ height: 100, width: 100, x: 100, y: 100 }, [], 4);

    // result
    expect(snap).toEqual({ delta: { x: 0, y: 0 }, guides: { labels: [], lines: [] } });
  });

  it('should combine a horizontal and vertical snap correction when both patterns are close', () => {
    // before — active sits 2px right and 2px below the perfectly centered (20px both sides) spot
    const candidates = [
      { bounds: { height: 100, width: 80, x: 0, y: 100 } },
      { bounds: { height: 100, width: 50, x: 220, y: 100 } },
      { bounds: { height: 80, width: 100, x: 100, y: 0 } },
      { bounds: { height: 50, width: 100, x: 100, y: 220 } },
    ];

    // action
    const snap = getEqualSpacingSnap({ height: 100, width: 100, x: 102, y: 102 }, candidates, 4);

    // result
    expect(snap.delta).toEqual({ x: -2, y: -2 });
    expect(snap.guides.lines).toHaveLength(4);
    expect(snap.guides.labels).toHaveLength(4);
    expect(snap.guides.labels.every((label) => label.text === '20')).toBe(true);
  });
});
