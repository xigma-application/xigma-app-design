// utils
import { isStraightSegment } from '../isStraightSegment';

describe('isStraightSegment', () => {
  it('should be true when neither tangent is set', () => {
    expect(isStraightSegment({ tangentEnd: null, tangentStart: null })).toBe(true);
  });

  it('should be false when tangentStart is set', () => {
    expect(isStraightSegment({ tangentEnd: null, tangentStart: { x: 1, y: 0 } })).toBe(false);
  });

  it('should be false when tangentEnd is set', () => {
    expect(isStraightSegment({ tangentEnd: { x: 1, y: 0 }, tangentStart: null })).toBe(false);
  });

  it('should be false when both tangents are set', () => {
    expect(isStraightSegment({ tangentEnd: { x: 1, y: 0 }, tangentStart: { x: -1, y: 0 } })).toBe(false);
  });
});
