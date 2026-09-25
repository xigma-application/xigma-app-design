// types
import { TVectorSegment } from 'types/design/types';

// utils
import { isStraightVectorSegment } from '../isStraightVectorSegment';

const segment = (tangentStart: TVectorSegment['tangentStart'], tangentEnd: TVectorSegment['tangentEnd']): TVectorSegment =>
  ({ endId: 'b', id: 's', startId: 'a', tangentEnd, tangentStart }) as TVectorSegment;

describe('isStraightVectorSegment', () => {
  it('should be straight when both tangents are missing or zero', () => {
    // result
    expect(isStraightVectorSegment(segment(null, { x: 0, y: 0 }))).toBe(true);
  });

  it('should be curved when either tangent has length', () => {
    // result
    expect(isStraightVectorSegment(segment({ x: 1, y: 0 }, null))).toBe(false);
    expect(isStraightVectorSegment(segment(null, { x: 0, y: 2 }))).toBe(false);
  });
});
