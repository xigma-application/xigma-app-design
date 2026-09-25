// types
import { StrokeSides } from 'types/design/enums';

// utils
import { getStrokeSidesChange } from '../getStrokeSidesChange';

const CLEARED = { strokeBottomWidth: undefined, strokeLeftWidth: undefined, strokeRightWidth: undefined, strokeTopWidth: undefined };
const custom = { strokeBottomWidth: 1, strokeLeftWidth: 2, strokeRightWidth: 0, strokeSides: StrokeSides.custom, strokeTopWidth: 5 };

describe('getStrokeSidesChange', () => {
  it('should switch to all sides at the widest width, clearing the per-side widths', () => {
    // result
    expect(getStrokeSidesChange(custom, StrokeSides.all)).toEqual({ ...CLEARED, strokeSides: StrokeSides.all, strokeWidth: 5 });
  });

  it('should switch to custom sides seeded with the current side widths', () => {
    // result
    expect(getStrokeSidesChange({ strokeWidth: 3 }, StrokeSides.custom)).toEqual({
      strokeBottomWidth: 3,
      strokeLeftWidth: 3,
      strokeRightWidth: 3,
      strokeSides: StrokeSides.custom,
      strokeTopWidth: 3,
      strokeWidth: 3,
    });
  });

  it('should switch to one side keeping its width, or the widest one when that side had none', () => {
    // result
    expect(getStrokeSidesChange(custom, StrokeSides.left)).toEqual({ ...CLEARED, strokeSides: StrokeSides.left, strokeWidth: 2 });
    expect(getStrokeSidesChange(custom, StrokeSides.right)).toEqual({ ...CLEARED, strokeSides: StrokeSides.right, strokeWidth: 5 });
  });
});
