// types
import { TLoopEdge } from 'utils/canvas/vectorNetwork/convertShapeToVector/utils/buildClosedVectorLoop';

// utils
import { findStraightRunEnd } from '../findStraightRunEnd';

const straight: TLoopEdge = { start: { x: 0, y: 0 }, end: { x: 1, y: 0 }, tangentStart: null, tangentEnd: null };
const curve: TLoopEdge = { start: { x: 0, y: 0 }, end: { x: 1, y: 0 }, tangentStart: { x: 1, y: 1 }, tangentEnd: { x: -1, y: -1 } };

describe('findStraightRunEnd', () => {
  it('returns the same index when the edge at start is not followed by another straight edge', () => {
    expect(findStraightRunEnd([curve, straight, curve], 1)).toBe(1);
  });

  it('extends through consecutive straight edges', () => {
    expect(findStraightRunEnd([curve, straight, straight, straight, curve], 1)).toBe(3);
  });

  it('stops at a curve edge', () => {
    expect(findStraightRunEnd([curve, straight, straight, curve, straight], 1)).toBe(2);
  });

  it('stops at the end of the array (does not wrap)', () => {
    expect(findStraightRunEnd([curve, straight, straight], 1)).toBe(2);
  });
});
