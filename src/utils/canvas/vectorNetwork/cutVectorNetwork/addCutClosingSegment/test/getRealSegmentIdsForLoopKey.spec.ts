// utils
import { getRealSegmentIdsForLoopKey } from '../getRealSegmentIdsForLoopKey';

describe('getRealSegmentIdsForLoopKey', () => {
  it('should extract the real segment id from each pieceKey in a comma-joined loopKey', () => {
    // result
    expect(getRealSegmentIdsForLoopKey('segA[x|y],segB[p|q]')).toEqual(new Set(['segA', 'segB']));
  });

  it('should dedupe repeated real segment ids across pieceKeys', () => {
    // result
    expect(getRealSegmentIdsForLoopKey('segA[x|y],segA[p|q]')).toEqual(new Set(['segA']));
  });
});
