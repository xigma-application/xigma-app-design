// utils
import { isStraightVectorSegmentAt } from '../isStraightVectorSegmentAt';

const segment = { endId: 'b', id: 's', startId: 'a', tangentEnd: null, tangentStart: null };

describe('isStraightVectorSegmentAt', () => {
  it('should accept a straight segment at either of its ends', () => {
    // result
    expect(isStraightVectorSegmentAt(segment, 'a')).toBe(true);
    expect(isStraightVectorSegmentAt(segment, 'b')).toBe(true);
  });

  it('should reject a curved segment, a loop onto itself and a vertex it does not touch', () => {
    // result
    expect(isStraightVectorSegmentAt({ ...segment, tangentStart: { x: 1, y: 0 } }, 'a')).toBe(false);
    expect(isStraightVectorSegmentAt({ ...segment, tangentEnd: { x: 1, y: 0 } }, 'a')).toBe(false);
    expect(isStraightVectorSegmentAt({ ...segment, endId: 'a' }, 'a')).toBe(false);
    expect(isStraightVectorSegmentAt(segment, 'c')).toBe(false);
  });
});
