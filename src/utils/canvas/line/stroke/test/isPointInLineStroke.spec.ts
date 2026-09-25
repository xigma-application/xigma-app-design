// types
import { StrokeAlign, StrokeStyle } from 'types/design/enums';

// utils
import { isPointInLineStroke } from '../isPointInLineStroke';
import { makeLine } from './fixtures';

describe('isPointInLineStroke', () => {
  it('should hit the stroke where it is drawn, following an inside position', () => {
    // mock
    const inside = makeLine({ strokeAlign: StrokeAlign.inside, strokeWidth: 10 });

    // result
    expect(isPointInLineStroke({ x: 50, y: -8 }, inside)).toBe(true);
    expect(isPointInLineStroke({ x: 50, y: 3 }, inside)).toBe(false);
  });

  it('should hit a dash but not the gap between dashes', () => {
    // mock
    const dashed = makeLine({ strokeDash: 10, strokeGap: 10, strokeStyle: StrokeStyle.dashed, strokeWidth: 10 });

    // result
    expect(isPointInLineStroke({ x: 5, y: 0 }, dashed)).toBe(true);
    expect(isPointInLineStroke({ x: 15, y: 0 }, dashed)).toBe(false);
  });

  it('should miss a zero-length line', () => {
    // result
    expect(isPointInLineStroke({ x: 0, y: 0 }, makeLine({ width: 0 }))).toBe(false);
  });
});
