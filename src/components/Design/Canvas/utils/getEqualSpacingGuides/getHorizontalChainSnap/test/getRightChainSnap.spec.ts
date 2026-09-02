// utils
import { getEdges } from '../../../getDistanceGuides/getEdges';
import { getRightChainSnap } from '../getRightChainSnap';

describe('getRightChainSnap', () => {
  it('should snap onto the right neighbour, matching the gap that neighbour already has to its own further neighbour', () => {
    // mock — shape2 (40..90) and shape3 (100..150) sit with a 10px gap; active sits at 8..28,
    // 2px more than the 10..30 that would give it the same 10px gap to shape2
    const shape2 = { bounds: { height: 50, width: 50, x: 40, y: 0 } };
    const shape3 = { bounds: { height: 50, width: 50, x: 100, y: 0 } };
    const active = getEdges({ height: 20, width: 20, x: 8, y: 0 });

    // action
    const snap = getRightChainSnap(active, shape2, [shape2, shape3], 8);

    // result
    expect(snap.deltaX).toBe(2);
    expect(snap.lines).toHaveLength(2);
    expect(snap.labels.every((label) => label.text === '10')).toBe(true);
  });

  it('should return no snap when the right neighbour has no further neighbour of its own', () => {
    // mock — a single right neighbour, nothing beyond it
    const shape3 = { bounds: { height: 30, width: 30, x: 100, y: 0 } };
    const active = getEdges({ height: 20, width: 20, x: 60, y: 0 });

    // action
    const snap = getRightChainSnap(active, shape3, [shape3], 8);

    // result
    expect(snap).toEqual({ deltaX: 0, labels: [], lines: [] });
  });

  it('should return no snap when the reference gap is not positive (flush contact)', () => {
    // mock — shape2 and shape3 touch exactly (no gap to reference)
    const shape2 = { bounds: { height: 30, width: 30, x: 60, y: 0 } };
    const shape3 = { bounds: { height: 30, width: 30, x: 90, y: 0 } };
    const active = getEdges({ height: 20, width: 20, x: 20, y: 0 });

    // action
    const snap = getRightChainSnap(active, shape2, [shape2, shape3], 8);

    // result
    expect(snap).toEqual({ deltaX: 0, labels: [], lines: [] });
  });

  it('should return no snap when the mismatch exceeds tolerance', () => {
    // mock — reference gap is 10px, active's current gap to shape2 is 30px — far outside tolerance
    const shape2 = { bounds: { height: 50, width: 50, x: 40, y: 0 } };
    const shape3 = { bounds: { height: 50, width: 50, x: 100, y: 0 } };
    const active = getEdges({ height: 20, width: 20, x: -30, y: 0 });

    // action
    const snap = getRightChainSnap(active, shape2, [shape2, shape3], 8);

    // result
    expect(snap).toEqual({ deltaX: 0, labels: [], lines: [] });
  });
});
