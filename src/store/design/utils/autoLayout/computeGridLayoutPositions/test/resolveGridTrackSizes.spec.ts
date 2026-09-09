// types
import { SizingMode } from 'types/design/enums';
import { TGridTrackSize } from 'types/design/types';

// utils
import { resolveGridTrackSizes } from '../resolveGridTrackSizes';

const fill = (value?: number): TGridTrackSize => ({ mode: SizingMode.fill, value });
const fixed = (value?: number): TGridTrackSize => ({ mode: SizingMode.fixed, value });
const hug = (): TGridTrackSize => ({ mode: SizingMode.hug });

describe('resolveGridTrackSizes', () => {
  it('should return an empty array for no tracks', () => {
    expect(resolveGridTrackSizes([], 100, 10, false, [])).toEqual([]);
  });

  it('should split the available space evenly across equal-weight fill tracks, minus the gaps', () => {
    expect(resolveGridTrackSizes([fill(), fill()], 210, 10, false, [0, 0])).toEqual([100, 100]);
  });

  it('should split fill tracks in proportion to their fr weight', () => {
    expect(resolveGridTrackSizes([fill(1), fill(2)], 300, 0, false, [0, 0])).toEqual([100, 200]);
  });

  it('should give a fixed track its value and hand the rest to the fill track', () => {
    expect(resolveGridTrackSizes([fixed(80), fill()], 200, 20, false, [0, 0])).toEqual([80, 100]);
  });

  it('should treat a fixed track with no value, or a negative value, as zero', () => {
    expect(resolveGridTrackSizes([fixed(), fixed(-40)], 100, 0, false, [0, 0])).toEqual([0, 0]);
  });

  it('should size a hug track to its content max, defaulting a missing entry to zero', () => {
    expect(resolveGridTrackSizes([hug(), hug()], 500, 0, false, [45])).toEqual([45, 0]);
  });

  it('should clamp the free space at zero when the reserved size already exceeds what is available', () => {
    expect(resolveGridTrackSizes([fixed(300), fill()], 100, 0, false, [0, 0])).toEqual([300, 0]);
  });

  it('should collapse fill tracks to their content max when the frame axis hugs, defaulting a missing entry to zero', () => {
    expect(resolveGridTrackSizes([fill(), fill()], 0, 0, true, [30])).toEqual([30, 0]);
  });

  it('should collapse a zero-weight fill track to its content max', () => {
    expect(resolveGridTrackSizes([fill(0), fill(0)], 200, 0, false, [10, 20])).toEqual([10, 20]);
  });
});
