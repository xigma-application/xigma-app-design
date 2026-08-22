// utils
import { getVectorFillPieceKey } from '../getVectorFillPieceKey';

describe('getVectorFillPieceKey', () => {
  it('should format a real segment id with its two boundary keys, sorted', () => {
    expect(getVectorFillPieceKey('s1', { end: 'v:b', start: 'v:a' })).toBe('s1[v:a|v:b]');
  });

  it('should sort the boundaries regardless of which one is start vs end', () => {
    expect(getVectorFillPieceKey('s1', { end: 'v:a', start: 'v:b' })).toBe('s1[v:a|v:b]');
  });

  it('should format a crossing boundary the same way as a real-vertex boundary', () => {
    expect(getVectorFillPieceKey('s1', { end: 'x:s2:0', start: 'v:a' })).toBe('s1[v:a|x:s2:0]');
  });
});
