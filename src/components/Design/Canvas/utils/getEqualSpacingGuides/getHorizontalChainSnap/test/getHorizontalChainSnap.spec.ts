// utils
import { getEdges } from '../../../getDistanceGuides/getEdges';
import { getHorizontalChainSnap } from '../getHorizontalChainSnap';

describe('getHorizontalChainSnap', () => {
  it('should return no snap when there is no neighbour on either side', () => {
    // action
    const snap = getHorizontalChainSnap(getEdges({ height: 20, width: 20, x: 1000, y: 0 }), [], 8);

    // result
    expect(snap).toEqual({ deltaX: 0, labels: [], lines: [] });
  });

  it('should return the left snap when it matches', () => {
    // mock — shape1 (0..30) and shape2 (40..90) sit with a 10px gap; active sits at 98..118,
    // 2px short of the 100..120 that would give it the same 10px gap to shape2
    const shape1 = { bounds: { height: 30, width: 30, x: 0, y: 0 } };
    const shape2 = { bounds: { height: 50, width: 50, x: 40, y: 0 } };
    const active = getEdges({ height: 20, width: 20, x: 98, y: 0 });

    // action
    const snap = getHorizontalChainSnap(active, [shape1, shape2], 8);

    // result
    expect(snap.deltaX).toBe(2);
  });

  it('should fall back to the right snap when the left side has no match', () => {
    // mock — shape2 (40..90) and shape3 (100..150) sit with a 10px gap; active sits at 8..28 with no
    // left neighbour at all, 2px more than the 10..30 that would give it the same 10px gap to shape2
    const shape2 = { bounds: { height: 50, width: 50, x: 40, y: 0 } };
    const shape3 = { bounds: { height: 50, width: 50, x: 100, y: 0 } };
    const active = getEdges({ height: 20, width: 20, x: 8, y: 0 });

    // action
    const snap = getHorizontalChainSnap(active, [shape2, shape3], 8);

    // result
    expect(snap.deltaX).toBe(2);
  });
});
