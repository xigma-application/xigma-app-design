// types
import { SizingMode } from 'types/design/enums';
import { TGridTrackChild } from '../types';
import { TGridTrackSize } from 'types/design/types';

// utils
import { getGridTrackMultiDeleteResult } from '../getGridTrackMultiDeleteResult';

const t = (value: number): TGridTrackSize => ({ mode: SizingMode.fixed, value });
const tracks = [t(0), t(1), t(2), t(3)];
const child = (id: string, anchorIndex: number | undefined, span: number): TGridTrackChild => ({ anchorIndex, id, span });

describe('getGridTrackMultiDeleteResult', () => {
  it('should remove one track and re-anchor the affected children', () => {
    // before
    const result = getGridTrackMultiDeleteResult(tracks, [child('a', 3, 1)], [1]);

    // result
    expect(result.tracks).toEqual([t(0), t(2), t(3)]);
    expect(result.count).toBe(3);
    expect(result.childUpdates).toEqual([{ anchorIndex: 2, id: 'a', span: 1 }]);
  });

  it('should apply several removals from the highest index down and fold the child updates', () => {
    // before
    const result = getGridTrackMultiDeleteResult(tracks, [child('a', 3, 1), child('b', 1, 1)], [0, 2]);

    // result
    expect(result.tracks).toEqual([t(1), t(3)]);
    expect(result.count).toBe(2);
    expect(result.childUpdates).toEqual([
      { anchorIndex: 1, id: 'a', span: 1 },
      { anchorIndex: 0, id: 'b', span: 1 },
    ]);
  });

  it('should release a single-cell child into auto-placement when its only track goes', () => {
    // before
    const result = getGridTrackMultiDeleteResult(tracks, [child('a', 1, 1)], [1, 0]);

    // result — track 1 removed releases the child, then track 0 shifts nothing (child already anchorless)
    expect(result.childUpdates).toEqual([{ anchorIndex: undefined, id: 'a', span: undefined }]);
  });

  it('should never delete the last remaining track', () => {
    // before
    const result = getGridTrackMultiDeleteResult([t(0), t(1)], [], [0, 1]);

    // result
    expect(result.tracks).toEqual([t(0)]);
    expect(result.count).toBe(1);
  });

  it('should ignore duplicate, negative and out-of-range indices', () => {
    // before
    const result = getGridTrackMultiDeleteResult(tracks, [], [1, 1, -1, 9]);

    // result
    expect(result.tracks).toEqual([t(0), t(2), t(3)]);
    expect(result.count).toBe(3);
  });
});
