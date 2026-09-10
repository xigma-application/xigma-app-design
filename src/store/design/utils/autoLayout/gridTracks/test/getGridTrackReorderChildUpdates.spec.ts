// types
import { TGridTrackChild } from '../types';

// utils
import { getGridTrackReorderChildUpdates } from '../getGridTrackReorderChildUpdates';

const child = (id: string, anchorIndex: number | undefined, span: number): TGridTrackChild => ({ anchorIndex, id, span });

describe('getGridTrackReorderChildUpdates', () => {
  it('should re-anchor children whose spanned tracks stay contiguous', () => {
    // before
    const result = getGridTrackReorderChildUpdates([child('wide', 0, 2), child('narrow', 2, 1)], [2, 3, 0, 1]);

    // result
    expect(result).toEqual({
      ok: true,
      updates: [
        { anchorIndex: 2, id: 'wide' },
        { anchorIndex: 0, id: 'narrow' },
      ],
    });
  });

  it('should reject the reorder when a span would be split apart', () => {
    // before
    const result = getGridTrackReorderChildUpdates([child('wide', 1, 2)], [0, 1, 3, 2]);

    // result
    expect(result).toEqual({ ok: false, updates: [] });
  });

  it('should ignore auto-placed children with no anchor', () => {
    expect(getGridTrackReorderChildUpdates([child('a', undefined, 1)], [1, 0])).toEqual({ ok: true, updates: [] });
  });

  it('should ignore a child whose anchor is negative', () => {
    expect(getGridTrackReorderChildUpdates([child('a', -1, 1)], [1, 0])).toEqual({ ok: true, updates: [] });
  });

  it('should ignore a child whose span reaches past the track count', () => {
    expect(getGridTrackReorderChildUpdates([child('a', 1, 3)], [1, 0])).toEqual({ ok: true, updates: [] });
  });
});
