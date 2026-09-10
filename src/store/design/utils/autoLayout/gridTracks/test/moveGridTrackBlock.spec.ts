// types
import { SizingMode } from 'types/design/enums';
import { TGridTrackSize } from 'types/design/types';

// utils
import { moveGridTrackBlock } from '../moveGridTrackBlock';

const t = (value: number): TGridTrackSize => ({ mode: SizingMode.fixed, value });
const tracks = [t(0), t(1), t(2), t(3)];

describe('moveGridTrackBlock', () => {
  it('should move a single track downward and report the permutation', () => {
    // before
    const result = moveGridTrackBlock(tracks, 1, 1, 3);

    // result
    expect(result.tracks).toEqual([t(0), t(2), t(1), t(3)]);
    expect(result.newIndexByOld).toEqual([0, 2, 1, 3]);
  });

  it('should move a single track upward', () => {
    // before
    const result = moveGridTrackBlock(tracks, 2, 1, 0);

    // result
    expect(result.tracks).toEqual([t(2), t(0), t(1), t(3)]);
    expect(result.newIndexByOld).toEqual([1, 2, 0, 3]);
  });

  it('should move a contiguous block as one unit', () => {
    // before
    const result = moveGridTrackBlock(tracks, 0, 2, 4);

    // result
    expect(result.tracks).toEqual([t(2), t(3), t(0), t(1)]);
    expect(result.newIndexByOld).toEqual([2, 3, 0, 1]);
  });

  it('should be an identity move when the slot sits at the block start', () => {
    // before
    const result = moveGridTrackBlock(tracks, 1, 1, 1);

    // result
    expect(result.tracks).toEqual(tracks);
    expect(result.newIndexByOld).toEqual([0, 1, 2, 3]);
  });

  it('should treat a slot inside the moved block as an identity move', () => {
    // before
    const result = moveGridTrackBlock(tracks, 1, 2, 2);

    // result
    expect(result.tracks).toEqual(tracks);
    expect(result.newIndexByOld).toEqual([0, 1, 2, 3]);
  });

  it('should clamp a slot past the end to the last position', () => {
    // before
    const result = moveGridTrackBlock(tracks, 0, 1, 99);

    // result
    expect(result.tracks).toEqual([t(1), t(2), t(3), t(0)]);
    expect(result.newIndexByOld).toEqual([3, 0, 1, 2]);
  });
});
