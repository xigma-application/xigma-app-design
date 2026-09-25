// types
import { StrokeAlign } from 'types/design/enums';

// utils
import { getLineStrokeBounds } from '../getLineStrokeBounds';
import { makeLine } from './fixtures';

describe('getLineStrokeBounds', () => {
  it('should span the drawn stroke, moved to the side for an outside position', () => {
    // result
    expect(getLineStrokeBounds(makeLine({ strokeAlign: StrokeAlign.outside, strokeWidth: 10 }))).toEqual({
      height: 10,
      width: 100,
      x: 0,
      y: 0,
    });
  });

  it('should have no bounds for a zero-length line', () => {
    // result
    expect(getLineStrokeBounds(makeLine({ width: 0 }))).toBeNull();
  });
});
