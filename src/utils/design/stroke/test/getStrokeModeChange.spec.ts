// types
import { StrokeMode, StrokeSides } from 'types/design/enums';

// utils
import { getStrokeModeChange } from '../getStrokeModeChange';

describe('getStrokeModeChange', () => {
  it('should only set the mode when leaving sides untouched', () => {
    expect(getStrokeModeChange({ strokeWidth: 4 }, StrokeMode.brush)).toEqual({ strokeMode: StrokeMode.brush });
    expect(getStrokeModeChange({ strokeWidth: 4 }, StrokeMode.dynamic)).toEqual({ strokeMode: StrokeMode.dynamic });
  });

  it('should reset a single side to all with the same weight when switching to dynamic', () => {
    expect(getStrokeModeChange({ strokeSides: StrokeSides.top, strokeWidth: 4 }, StrokeMode.dynamic)).toMatchObject({
      strokeMode: StrokeMode.dynamic,
      strokeSides: StrokeSides.all,
      strokeWidth: 4,
    });
  });

  it('should reset custom sides to all with the largest side when switching to dynamic', () => {
    const node = { strokeBottomWidth: 3, strokeLeftWidth: 9, strokeRightWidth: 1, strokeSides: StrokeSides.custom, strokeTopWidth: 2 };

    expect(getStrokeModeChange(node, StrokeMode.dynamic)).toMatchObject({ strokeSides: StrokeSides.all, strokeWidth: 9 });
  });

  it('should reset a single side to all when switching to brush too', () => {
    expect(getStrokeModeChange({ strokeSides: StrokeSides.left, strokeWidth: 6 }, StrokeMode.brush)).toMatchObject({
      strokeMode: StrokeMode.brush,
      strokeSides: StrokeSides.all,
      strokeWidth: 6,
    });
  });
});
