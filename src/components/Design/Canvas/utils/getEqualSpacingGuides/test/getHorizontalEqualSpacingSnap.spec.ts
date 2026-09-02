// utils
import { getEdges } from '../../getDistanceGuides/getEdges';
import { getHorizontalEqualSpacingSnap } from '../getHorizontalEqualSpacingSnap';

const LEFT = getEdges({ height: 100, width: 80, x: 0, y: 0 });
const RIGHT = getEdges({ height: 100, width: 50, x: 220, y: 0 });

describe('getHorizontalEqualSpacingSnap', () => {
  it('should snap into the perfectly centered position when close enough, and show a guide there', () => {
    // before — active sits 2px right of the ideal (equal, 20px both sides) position
    const active = getEdges({ height: 100, width: 100, x: 102, y: 0 });

    // action
    const snap = getHorizontalEqualSpacingSnap(active, { left: LEFT, right: RIGHT }, 4);

    // result
    expect(snap.deltaX).toBe(-2);
    expect(snap.lines).toEqual([
      { dashed: false, x1: 80, x2: 100, y1: 50, y2: 50 },
      { dashed: false, x1: 200, x2: 220, y1: 50, y2: 50 },
    ]);
    expect(snap.labels).toEqual([
      { anchor: { x: 90, y: 50 }, offsetDirection: { x: 0, y: 1 }, text: '20' },
      { anchor: { x: 210, y: 50 }, offsetDirection: { x: 0, y: 1 }, text: '20' },
    ]);
  });

  it('should not snap when the mismatch from the ideal position exceeds the tolerance', () => {
    // before — 10px off, tolerance is 4
    const active = getEdges({ height: 100, width: 100, x: 110, y: 0 });

    // action
    const snap = getHorizontalEqualSpacingSnap(active, { left: LEFT, right: RIGHT }, 4);

    // result
    expect(snap).toEqual({ deltaX: 0, labels: [], lines: [] });
  });

  it('should not snap when the neighbors are too close together for a positive gap to exist', () => {
    // before — 100px wide active can't fit between neighbors only 15px apart
    const active = getEdges({ height: 100, width: 100, x: 90, y: 0 });
    const nearRight = getEdges({ height: 100, width: 50, x: 95, y: 0 });

    // action
    const snap = getHorizontalEqualSpacingSnap(active, { left: LEFT, right: nearRight }, 4);

    // result
    expect(snap).toEqual({ deltaX: 0, labels: [], lines: [] });
  });

  it('should not snap when only one side has a neighbor', () => {
    // before
    const active = getEdges({ height: 100, width: 100, x: 100, y: 0 });

    // action
    const snap = getHorizontalEqualSpacingSnap(active, { left: LEFT, right: null }, 4);

    // result
    expect(snap).toEqual({ deltaX: 0, labels: [], lines: [] });
  });
});
