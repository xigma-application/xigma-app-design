// utils
import { getEdges } from '../../../getDistanceGuides/getEdges';
import { getVerticalChainSnap } from '../getVerticalChainSnap';

describe('getVerticalChainSnap', () => {
  it('should return no snap when there is no neighbour on either side', () => {
    // action
    const snap = getVerticalChainSnap(getEdges({ height: 20, width: 20, x: 0, y: 1000 }), [], 8);

    // result
    expect(snap).toEqual({ deltaY: 0, labels: [], lines: [] });
  });

  it('should return the top snap when it matches', () => {
    // mock — shape1 (0..30) and shape2 (40..90) sit with a 10px gap; active sits at 98..118,
    // 2px short of the 100..120 that would give it the same 10px gap to shape2
    const shape1 = { bounds: { height: 30, width: 30, x: 0, y: 0 } };
    const shape2 = { bounds: { height: 50, width: 50, x: 0, y: 40 } };
    const active = getEdges({ height: 20, width: 20, x: 0, y: 98 });

    // action
    const snap = getVerticalChainSnap(active, [shape1, shape2], 8);

    // result
    expect(snap.deltaY).toBe(2);
  });

  it('should fall back to the bottom snap when the top side has no match', () => {
    // mock — shape2 (40..90) and shape3 (100..150) sit with a 10px gap; active sits at 8..28 with no
    // top neighbour at all, 2px more than the 10..30 that would give it the same 10px gap to shape2
    const shape2 = { bounds: { height: 50, width: 50, x: 0, y: 40 } };
    const shape3 = { bounds: { height: 50, width: 50, x: 0, y: 100 } };
    const active = getEdges({ height: 20, width: 20, x: 0, y: 8 });

    // action
    const snap = getVerticalChainSnap(active, [shape2, shape3], 8);

    // result
    expect(snap.deltaY).toBe(2);
  });
});
