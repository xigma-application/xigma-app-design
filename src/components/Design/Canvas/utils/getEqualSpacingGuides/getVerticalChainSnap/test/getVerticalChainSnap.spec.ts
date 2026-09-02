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

  it('should return the flanked snap when a neighbour sits on both sides and the centred position matches', () => {
    // mock — top (0..80) and bottom (220..270) leave a 140px span for a 100-tall active shape, so the
    // ideal centred gap is 20px each side; active sits at y:102, 2px short of the centred y:100
    const top = { bounds: { height: 80, width: 100, x: 0, y: 0 } };
    const bottom = { bounds: { height: 50, width: 100, x: 0, y: 220 } };
    const active = getEdges({ height: 100, width: 100, x: 0, y: 102 });

    // action
    const snap = getVerticalChainSnap(active, [top, bottom], 4);

    // result
    expect(snap.deltaY).toBe(-2);
  });

  it('should fall back to a one-sided chain snap when a neighbour sits on both sides but flanked-centring does not match', () => {
    // mock — shape0 (0..30) and shape1 (40..60) sit with a 10px gap; active (68..78) is 2px short of
    // matching that same 10px gap to shape1, but far from centred against the distant shape3 (500..520)
    const shape0 = { bounds: { height: 30, width: 20, x: 0, y: 0 } };
    const shape1 = { bounds: { height: 20, width: 20, x: 0, y: 40 } };
    const shape3 = { bounds: { height: 20, width: 20, x: 0, y: 500 } };
    const active = getEdges({ height: 10, width: 10, x: 0, y: 68 });

    // action
    const snap = getVerticalChainSnap(active, [shape0, shape1, shape3], 8);

    // result
    expect(snap.deltaY).toBe(2);
  });
});
