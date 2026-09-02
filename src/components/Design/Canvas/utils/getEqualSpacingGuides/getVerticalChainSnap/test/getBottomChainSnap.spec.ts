// utils
import { getEdges } from '../../../getDistanceGuides/getEdges';
import { getBottomChainSnap } from '../getBottomChainSnap';

describe('getBottomChainSnap', () => {
  it('should snap onto the bottom neighbour, matching the gap that neighbour already has to its own further neighbour', () => {
    // mock — shape2 (40..90) and shape3 (100..150) sit with a 10px gap; active sits at 8..28,
    // 2px more than the 10..30 that would give it the same 10px gap to shape2
    const shape2 = { bounds: { height: 50, width: 50, x: 0, y: 40 } };
    const shape3 = { bounds: { height: 50, width: 50, x: 0, y: 100 } };
    const active = getEdges({ height: 20, width: 20, x: 0, y: 8 });

    // action
    const snap = getBottomChainSnap(active, shape2, [shape2, shape3], 8);

    // result
    expect(snap.deltaY).toBe(2);
    expect(snap.lines).toHaveLength(2);
    expect(snap.labels.every((label) => label.text === '10')).toBe(true);
  });

  it('should return no snap when the bottom neighbour has no further neighbour of its own', () => {
    // mock
    const shape3 = { bounds: { height: 30, width: 30, x: 0, y: 100 } };
    const active = getEdges({ height: 20, width: 20, x: 0, y: 60 });

    // action
    const snap = getBottomChainSnap(active, shape3, [shape3], 8);

    // result
    expect(snap).toEqual({ deltaY: 0, labels: [], lines: [] });
  });

  it('should return no snap when the reference gap is not positive (flush contact)', () => {
    // mock — shape2 and shape3 touch exactly (no gap to reference)
    const shape2 = { bounds: { height: 30, width: 30, x: 0, y: 60 } };
    const shape3 = { bounds: { height: 30, width: 30, x: 0, y: 90 } };
    const active = getEdges({ height: 20, width: 20, x: 0, y: 20 });

    // action
    const snap = getBottomChainSnap(active, shape2, [shape2, shape3], 8);

    // result
    expect(snap).toEqual({ deltaY: 0, labels: [], lines: [] });
  });

  it('should return no snap when the mismatch exceeds tolerance', () => {
    // mock — reference gap is 10px, active's current gap to shape2 is much larger
    const shape2 = { bounds: { height: 50, width: 50, x: 0, y: 40 } };
    const shape3 = { bounds: { height: 50, width: 50, x: 0, y: 100 } };
    const active = getEdges({ height: 20, width: 20, x: 0, y: -30 });

    // action
    const snap = getBottomChainSnap(active, shape2, [shape2, shape3], 8);

    // result
    expect(snap).toEqual({ deltaY: 0, labels: [], lines: [] });
  });
});
