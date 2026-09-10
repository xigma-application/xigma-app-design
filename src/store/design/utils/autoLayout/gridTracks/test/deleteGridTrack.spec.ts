// types
import { SizingMode } from 'types/design/enums';

// utils
import { deleteGridTrack } from '../deleteGridTrack';

const track = (value: number): { mode: SizingMode; value: number } => ({ mode: SizingMode.fixed, value });

describe('deleteGridTrack', () => {
  it('should drop the track at the given index', () => {
    // before
    const next = deleteGridTrack([track(1), track(2), track(3)], 1);

    // result
    expect(next).toEqual([track(1), track(3)]);
  });

  it('should return a copy when the index is out of range', () => {
    // before
    const tracks = [track(1)];
    const next = deleteGridTrack(tracks, 5);

    // result
    expect(next).toEqual([track(1)]);
    expect(next).not.toBe(tracks);
  });
});
