// utils
import { getCellSegments } from '../getCellSegments';

describe('getCellSegments', () => {
  it('should cut a single corner off with one segment', () => {
    // result
    expect(getCellSegments(1, false)).toEqual([['left', 'top']]);
    expect(getCellSegments(3, false)).toEqual([['left', 'right']]);
  });

  it('should have nothing for an empty or a full cell', () => {
    // result
    expect(getCellSegments(0, false)).toEqual([]);
    expect(getCellSegments(15, true)).toEqual([]);
  });

  it('should resolve a saddle by its centre value', () => {
    // result
    expect(getCellSegments(5, true)).toEqual([
      ['top', 'right'],
      ['left', 'bottom'],
    ]);
    expect(getCellSegments(5, false)).toEqual([
      ['left', 'top'],
      ['right', 'bottom'],
    ]);
  });
});
