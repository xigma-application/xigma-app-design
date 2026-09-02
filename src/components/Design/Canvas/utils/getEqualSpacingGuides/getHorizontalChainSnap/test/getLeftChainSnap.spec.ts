// utils
import { getEdges } from '../../../getDistanceGuides/getEdges';
import { getLeftChainSnap } from '../getLeftChainSnap';

describe('getLeftChainSnap', () => {
  it('should snap onto the left neighbour, matching the gap that neighbour already has to its own further neighbour', () => {
    // mock — shape1 (0..30) and shape2 (40..90) sit with a 10px gap; active sits at 98..118,
    // 2px short of the 100..120 that would give it the same 10px gap to shape2
    const shape1 = { bounds: { height: 30, width: 30, x: 0, y: 0 } };
    const shape2 = { bounds: { height: 50, width: 50, x: 40, y: 0 } };
    const active = getEdges({ height: 20, width: 20, x: 98, y: 0 });

    // action
    const snap = getLeftChainSnap(active, shape2, [shape1, shape2], 8);

    // result
    expect(snap.deltaX).toBe(2);
    expect(snap.lines).toHaveLength(2);
    expect(snap.labels.every((label) => label.text === '10')).toBe(true);
  });

  it('should return no snap when the left neighbour has no further neighbour of its own', () => {
    // mock — a single left neighbour, nothing beyond it
    const shape1 = { bounds: { height: 30, width: 30, x: 0, y: 0 } };
    const active = getEdges({ height: 20, width: 20, x: 40, y: 0 });

    // action
    const snap = getLeftChainSnap(active, shape1, [shape1], 8);

    // result
    expect(snap).toEqual({ deltaX: 0, labels: [], lines: [] });
  });

  it('should return no snap when the reference gap is not positive (flush contact)', () => {
    // mock — shape1 and shape2 touch exactly (no gap to reference)
    const shape1 = { bounds: { height: 30, width: 30, x: 0, y: 0 } };
    const shape2 = { bounds: { height: 30, width: 30, x: 30, y: 0 } };
    const active = getEdges({ height: 20, width: 20, x: 60, y: 0 });

    // action
    const snap = getLeftChainSnap(active, shape2, [shape1, shape2], 8);

    // result
    expect(snap).toEqual({ deltaX: 0, labels: [], lines: [] });
  });

  it('should return no snap when the mismatch exceeds tolerance', () => {
    // mock — reference gap is 10px, active's current gap to shape2 is 30px — far outside tolerance
    const shape1 = { bounds: { height: 30, width: 30, x: 0, y: 0 } };
    const shape2 = { bounds: { height: 50, width: 50, x: 40, y: 0 } };
    const active = getEdges({ height: 20, width: 20, x: 120, y: 0 });

    // action
    const snap = getLeftChainSnap(active, shape2, [shape1, shape2], 8);

    // result
    expect(snap).toEqual({ deltaX: 0, labels: [], lines: [] });
  });
});
