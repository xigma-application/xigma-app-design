// types
import { TGridTrackChild } from '../types';

// utils
import { getGridTrackLinkedIndices } from '../getGridTrackLinkedIndices';

const child = (id: string, anchorIndex: number | undefined, span: number): TGridTrackChild => ({ anchorIndex, id, span });

describe('getGridTrackLinkedIndices', () => {
  it('should default every track to a single-track group', () => {
    expect(getGridTrackLinkedIndices([], 3)).toEqual([[0], [1], [2]]);
  });

  it('should group every track a spanning child covers together', () => {
    expect(getGridTrackLinkedIndices([child('a', 0, 2)], 3)).toEqual([[0, 1], [0, 1], [2]]);
  });

  it('should ignore a single-cell child', () => {
    expect(getGridTrackLinkedIndices([child('a', 1, 1)], 3)).toEqual([[0], [1], [2]]);
  });

  it('should ignore an auto-placed child with no anchor', () => {
    expect(getGridTrackLinkedIndices([child('a', undefined, 2)], 3)).toEqual([[0], [1], [2]]);
  });

  it('should clip a span that reaches past the track count', () => {
    expect(getGridTrackLinkedIndices([child('a', 1, 3)], 3)).toEqual([[0], [1, 2], [1, 2]]);
  });
});
