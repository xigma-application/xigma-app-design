// types
import { TVectorSegment } from 'types/design/types';

// utils
import { sharesVertex } from '../sharesVertex';

const seg = (id: string, startId: string, endId: string): TVectorSegment => ({ endId, id, startId, tangentEnd: null, tangentStart: null });

describe('sharesVertex', () => {
  it('should return true when both segments share their startId', () => {
    // result
    expect(sharesVertex(seg('s1', 'a', 'b'), seg('s2', 'a', 'c'))).toBe(true);
  });

  it('should return true when both segments share their endId', () => {
    // result
    expect(sharesVertex(seg('s1', 'a', 'b'), seg('s2', 'c', 'b'))).toBe(true);
  });

  it('should return true when one segment’s startId matches the other’s endId', () => {
    // result
    expect(sharesVertex(seg('s1', 'a', 'b'), seg('s2', 'c', 'a'))).toBe(true);
  });

  it('should return false when the two segments share no vertex at all', () => {
    // result
    expect(sharesVertex(seg('s1', 'a', 'b'), seg('s2', 'c', 'd'))).toBe(false);
  });
});
