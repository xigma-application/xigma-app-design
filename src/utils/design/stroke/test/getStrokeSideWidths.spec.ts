// types
import { StrokeSides } from 'types/design/enums';

// utils
import { getStrokeSideWidths } from '../getStrokeSideWidths';

describe('getStrokeSideWidths', () => {
  it('should use the stroke width on every side by default, and zero without a width', () => {
    // result
    expect(getStrokeSideWidths({ strokeWidth: 2 })).toEqual({ bottom: 2, left: 2, right: 2, top: 2 });
    expect(getStrokeSideWidths({})).toEqual({ bottom: 0, left: 0, right: 0, top: 0 });
  });

  it('should use the per-side widths for custom sides, zero for missing ones', () => {
    // result
    expect(getStrokeSideWidths({ strokeLeftWidth: 1, strokeSides: StrokeSides.custom, strokeTopWidth: 3 })).toEqual({
      bottom: 0,
      left: 1,
      right: 0,
      top: 3,
    });
    expect(getStrokeSideWidths({ strokeBottomWidth: 4, strokeRightWidth: 2, strokeSides: StrokeSides.custom })).toEqual({
      bottom: 4,
      left: 0,
      right: 2,
      top: 0,
    });
  });

  it('should stroke only the chosen side', () => {
    // result
    expect(getStrokeSideWidths({ strokeSides: StrokeSides.top, strokeWidth: 5 })).toEqual({ bottom: 0, left: 0, right: 0, top: 5 });
  });
});
