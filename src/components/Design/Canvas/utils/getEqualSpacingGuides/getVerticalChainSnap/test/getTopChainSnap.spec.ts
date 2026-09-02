// utils
import { getEdges } from '../../../getDistanceGuides/getEdges';
import { getTopChainSnap } from '../getTopChainSnap';

describe('getTopChainSnap', () => {
  it('should snap onto the top neighbour, matching the gap that neighbour already has to its own further neighbour', () => {
    // mock — shape1 (0..30) and shape2 (40..90) sit with a 10px gap; active sits at 98..118,
    // 2px short of the 100..120 that would give it the same 10px gap to shape2
    const shape1 = { bounds: { height: 30, width: 30, x: 0, y: 0 } };
    const shape2 = { bounds: { height: 50, width: 50, x: 0, y: 40 } };
    const active = getEdges({ height: 20, width: 20, x: 0, y: 98 });

    // action
    const snap = getTopChainSnap(active, shape2, [shape1, shape2], 8);

    // result
    expect(snap.deltaY).toBe(2);
    expect(snap.lines).toHaveLength(2);
    expect(snap.labels.every((label) => label.text === '10')).toBe(true);
  });

  it('should return no snap when the top neighbour has no further neighbour of its own', () => {
    // mock
    const shape1 = { bounds: { height: 30, width: 30, x: 0, y: 0 } };
    const active = getEdges({ height: 20, width: 20, x: 0, y: 40 });

    // action
    const snap = getTopChainSnap(active, shape1, [shape1], 8);

    // result
    expect(snap).toEqual({ deltaY: 0, labels: [], lines: [] });
  });

  it('should return no snap when the reference gap is not positive (flush contact)', () => {
    // mock — shape1 and shape2 touch exactly (no gap to reference)
    const shape1 = { bounds: { height: 30, width: 30, x: 0, y: 0 } };
    const shape2 = { bounds: { height: 30, width: 30, x: 0, y: 30 } };
    const active = getEdges({ height: 20, width: 20, x: 0, y: 60 });

    // action
    const snap = getTopChainSnap(active, shape2, [shape1, shape2], 8);

    // result
    expect(snap).toEqual({ deltaY: 0, labels: [], lines: [] });
  });

  it('should return no snap when the mismatch exceeds tolerance', () => {
    // mock — reference gap is 10px, active's current gap to shape2 is much larger
    const shape1 = { bounds: { height: 30, width: 30, x: 0, y: 0 } };
    const shape2 = { bounds: { height: 50, width: 50, x: 0, y: 40 } };
    const active = getEdges({ height: 20, width: 20, x: 0, y: 120 });

    // action
    const snap = getTopChainSnap(active, shape2, [shape1, shape2], 8);

    // result
    expect(snap).toEqual({ deltaY: 0, labels: [], lines: [] });
  });
});
