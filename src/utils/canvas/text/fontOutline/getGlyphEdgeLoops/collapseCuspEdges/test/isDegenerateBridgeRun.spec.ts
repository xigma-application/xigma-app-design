// types
import { TLoopEdge } from 'utils/canvas/vectorNetwork/convertShapeToVector/utils/buildClosedVectorLoop';

// utils
import { isDegenerateBridgeRun } from '../isDegenerateBridgeRun';

const makeCurve = (length: number): TLoopEdge => ({
  start: { x: 0, y: 0 },
  end: { x: length, y: 0 },
  tangentStart: { x: 1, y: 1 },
  tangentEnd: { x: -1, y: -1 },
});

const makeStraight = (length: number): TLoopEdge => ({
  start: { x: 0, y: 0 },
  end: { x: length, y: 0 },
  tangentStart: null,
  tangentEnd: null,
});

describe('isDegenerateBridgeRun', () => {
  it('returns true for a short straight run flanked by two curves of typical length', () => {
    const bridge = makeStraight(0.3);

    expect(isDegenerateBridgeRun([bridge], 0, 0, makeCurve(1), makeCurve(1))).toBe(true);
  });

  it('returns false when the run is not much shorter than its flanking curves', () => {
    const bridge = makeStraight(0.9);

    expect(isDegenerateBridgeRun([bridge], 0, 0, makeCurve(1), makeCurve(1))).toBe(false);
  });

  it('sums every edge in the run, not just the first one', () => {
    const edges = [makeStraight(0.15), makeStraight(0.15)];

    // total run length 0.3 is still well under the threshold against curves of length 1
    expect(isDegenerateBridgeRun(edges, 0, 1, makeCurve(1), makeCurve(1))).toBe(true);
  });

  it('returns false when prevEdge is itself straight (not sandwiched between two curves)', () => {
    const bridge = makeStraight(0.1);

    expect(isDegenerateBridgeRun([bridge], 0, 0, makeStraight(1), makeCurve(1))).toBe(false);
  });

  it('returns false when nextEdge is itself straight (not sandwiched between two curves)', () => {
    const bridge = makeStraight(0.1);

    expect(isDegenerateBridgeRun([bridge], 0, 0, makeCurve(1), makeStraight(1))).toBe(false);
  });
});
