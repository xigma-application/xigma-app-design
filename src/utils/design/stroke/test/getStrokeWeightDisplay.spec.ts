// types
import { StrokeSides } from 'types/design/enums';

// utils
import { getStrokeWeightDisplay } from '../getStrokeWeightDisplay';

describe('getStrokeWeightDisplay', () => {
  it('should show the stroke width, defaulting to 1', () => {
    // result
    expect(getStrokeWeightDisplay({ strokeWidth: 3 })).toBe(3);
    expect(getStrokeWeightDisplay({})).toBe(1);
  });

  it('should show the shared width of custom sides, or nothing when they differ', () => {
    // mock
    const even = { strokeBottomWidth: 2, strokeLeftWidth: 2, strokeRightWidth: 2, strokeSides: StrokeSides.custom, strokeTopWidth: 2 };

    // result
    expect(getStrokeWeightDisplay(even)).toBe(2);
    expect(getStrokeWeightDisplay({ ...even, strokeLeftWidth: 1 })).toBeNull();
    expect(getStrokeWeightDisplay({ ...even, strokeTopWidth: 1 })).toBeNull();
    expect(getStrokeWeightDisplay({ ...even, strokeRightWidth: 1 })).toBeNull();
    expect(getStrokeWeightDisplay({ ...even, strokeBottomWidth: 1 })).toBeNull();
  });
});
