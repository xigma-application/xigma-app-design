// utils
import { getEdges } from '../../getDistanceGuides/getEdges';
import { getVerticalEqualSpacingSnap } from '../getVerticalEqualSpacingSnap';

const TOP = getEdges({ height: 80, width: 100, x: 0, y: 0 });
const BOTTOM = getEdges({ height: 50, width: 100, x: 0, y: 220 });

describe('getVerticalEqualSpacingSnap', () => {
  it('should snap into the perfectly centered position when close enough, and show a guide there', () => {
    // before — active sits 2px below the ideal (equal, 20px both sides) position
    const active = getEdges({ height: 100, width: 100, x: 0, y: 102 });

    // action
    const snap = getVerticalEqualSpacingSnap(active, { bottom: BOTTOM, top: TOP }, 4);

    // result
    expect(snap.deltaY).toBe(-2);
    expect(snap.lines).toEqual([
      { dashed: false, x1: 50, x2: 50, y1: 80, y2: 100 },
      { dashed: false, x1: 50, x2: 50, y1: 200, y2: 220 },
    ]);
    expect(snap.labels).toEqual([
      { anchor: { x: 50, y: 90 }, offsetDirection: { x: -1, y: 0 }, text: '20' },
      { anchor: { x: 50, y: 210 }, offsetDirection: { x: -1, y: 0 }, text: '20' },
    ]);
  });

  it('should not snap when the mismatch from the ideal position exceeds the tolerance', () => {
    // before
    const active = getEdges({ height: 100, width: 100, x: 0, y: 110 });

    // action
    const snap = getVerticalEqualSpacingSnap(active, { bottom: BOTTOM, top: TOP }, 4);

    // result
    expect(snap).toEqual({ deltaY: 0, labels: [], lines: [] });
  });

  it('should not snap when the neighbors are too close together for a positive gap to exist', () => {
    // before
    const active = getEdges({ height: 100, width: 100, x: 0, y: 90 });
    const nearBottom = getEdges({ height: 50, width: 100, x: 0, y: 95 });

    // action
    const snap = getVerticalEqualSpacingSnap(active, { bottom: nearBottom, top: TOP }, 4);

    // result
    expect(snap).toEqual({ deltaY: 0, labels: [], lines: [] });
  });

  it('should not snap when only one side has a neighbor', () => {
    // before
    const active = getEdges({ height: 100, width: 100, x: 0, y: 100 });

    // action
    const snap = getVerticalEqualSpacingSnap(active, { bottom: null, top: TOP }, 4);

    // result
    expect(snap).toEqual({ deltaY: 0, labels: [], lines: [] });
  });
});
