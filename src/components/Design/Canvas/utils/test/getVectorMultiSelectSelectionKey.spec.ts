// utils
import { getVectorMultiSelectSelectionKey } from '../getVectorMultiSelectSelectionKey';

describe('getVectorMultiSelectSelectionKey', () => {
  it('should join sorted vertex ids alone', () => {
    // result
    expect(getVectorMultiSelectSelectionKey(['v2', 'v1'], [])).toBe('v1,v2');
  });

  it('should join sorted handle keys alone', () => {
    // result
    expect(
      getVectorMultiSelectSelectionKey(
        [],
        [
          { end: 'end', segmentId: 's2' },
          { end: 'start', segmentId: 's1' },
        ],
      ),
    ).toBe('end:s2,start:s1');
  });

  it('should sort vertex ids and handle keys independently, vertices first', () => {
    // result
    expect(getVectorMultiSelectSelectionKey(['v2', 'v1'], [{ end: 'start', segmentId: 's1' }])).toBe('v1,v2,start:s1');
  });

  it('should return an empty string when nothing is selected', () => {
    // result
    expect(getVectorMultiSelectSelectionKey([], [])).toBe('');
  });
});
