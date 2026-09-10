// types
import { TGridTrackChild } from '../types';

// utils
import { getGridTrackDeleteChildUpdates } from '../getGridTrackDeleteChildUpdates';

const child = (id: string, anchorIndex: number | undefined, span: number): TGridTrackChild => ({ anchorIndex, id, span });

describe('getGridTrackDeleteChildUpdates', () => {
  it('should skip auto-placed children that have no anchor on the axis', () => {
    expect(getGridTrackDeleteChildUpdates([child('a', undefined, 1)], 0)).toEqual([]);
  });

  it('should shift the anchor left when a track before it is removed', () => {
    expect(getGridTrackDeleteChildUpdates([child('a', 2, 1)], 0)).toEqual([{ anchorIndex: 1, id: 'a', span: 1 }]);
  });

  it('should shrink the span when a track it covers is removed', () => {
    expect(getGridTrackDeleteChildUpdates([child('a', 1, 3)], 2)).toEqual([{ anchorIndex: 1, id: 'a', span: 2 }]);
  });

  it('should shrink the span when its own anchor track is removed but it still spans more', () => {
    expect(getGridTrackDeleteChildUpdates([child('a', 1, 2)], 1)).toEqual([{ anchorIndex: 1, id: 'a', span: 1 }]);
  });

  it('should release a single-cell child into auto-placement when its only track is removed', () => {
    expect(getGridTrackDeleteChildUpdates([child('a', 2, 1)], 2)).toEqual([{ anchorIndex: undefined, id: 'a', span: undefined }]);
  });

  it('should leave a child untouched when the removed track is past its span', () => {
    expect(getGridTrackDeleteChildUpdates([child('a', 0, 2)], 3)).toEqual([]);
  });

  it('should round and clamp a fractional span before comparing', () => {
    expect(getGridTrackDeleteChildUpdates([child('a', 0, 0.2)], 0)).toEqual([{ anchorIndex: undefined, id: 'a', span: undefined }]);
  });
});
