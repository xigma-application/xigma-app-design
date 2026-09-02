// utils
import { getChainSnap } from '../getChainSnap';

describe('getChainSnap', () => {
  it('should combine both axes into one delta and guide set (only the horizontal pattern matches here)', () => {
    // mock — shape1 (0..30) / shape2 (40..90) sit with a 10px gap; active's x is 2px short of the
    // matching position (y overlaps the candidates so the horizontal check applies, but there's no
    // vertical pattern for it to match)
    const active = { height: 20, width: 20, x: 98, y: 10 };
    const candidates = [{ bounds: { height: 30, width: 30, x: 0, y: 0 } }, { bounds: { height: 50, width: 50, x: 40, y: 0 } }];

    // action
    const snap = getChainSnap(active, candidates, 8);

    // result
    expect(snap.delta).toEqual({ x: 2, y: 0 });
    expect(snap.guides.lines.length).toBeGreaterThan(0);
  });

  it('should prefer a row match (same height) over the plain, size-agnostic chain match', () => {
    // mock — shape1 (0..30) / shape2 (40..90) share active's exact height (20) — a grid row
    const active = { height: 20, width: 20, x: 98, y: 0 };
    const candidates = [{ bounds: { height: 20, width: 30, x: 0, y: 0 } }, { bounds: { height: 20, width: 50, x: 40, y: 0 } }];

    // action
    const snap = getChainSnap(active, candidates, 8);

    // result
    expect(snap.delta).toEqual({ x: 2, y: 0 });
  });

  it('should prefer a column match (same width) over the plain, size-agnostic chain match', () => {
    // mock — shape1 (0..30) / shape2 (40..90) share active's exact width (20) — a grid column
    const active = { height: 20, width: 20, x: 0, y: 98 };
    const candidates = [{ bounds: { height: 30, width: 20, x: 0, y: 0 } }, { bounds: { height: 50, width: 20, x: 0, y: 40 } }];

    // action
    const snap = getChainSnap(active, candidates, 8);

    // result
    expect(snap.delta).toEqual({ x: 0, y: 2 });
  });

  it('should return a zero delta and empty guides when no pattern is close enough', () => {
    // action
    const snap = getChainSnap({ height: 20, width: 20, x: 1000, y: 1000 }, [], 8);

    // result
    expect(snap).toEqual({ delta: { x: 0, y: 0 }, guides: { labels: [], lines: [] } });
  });
});
