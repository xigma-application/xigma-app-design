// types
import { StrokeBrushDirection } from 'types/design/enums';
import { TStrokeBrushValues } from 'utils/design/stroke/getStrokeBrushValues';

// utils
import { getSharedStrokeBrushValue } from '../getSharedStrokeBrushValue';

const values = (patch: Partial<TStrokeBrushValues> = {}): TStrokeBrushValues => ({
  angularJitter: 0,
  brush: 'b',
  direction: StrokeBrushDirection.left,
  gap: 1,
  rotation: 0,
  sizeJitter: 0,
  wiggle: 0,
  ...patch,
});

describe('getSharedStrokeBrushValue', () => {
  it('should return the value shared by every stroke', () => {
    // result
    expect(getSharedStrokeBrushValue([values(), values({ gap: 3 })], 'brush')).toBe('b');
  });

  it('should return undefined when the value is mixed', () => {
    // result
    expect(getSharedStrokeBrushValue([values(), values({ gap: 3 })], 'gap')).toBeUndefined();
  });
});
