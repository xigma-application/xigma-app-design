// types
import { StrokeSides } from 'types/design/enums';

// utils
import { getStrokeSideEditChange } from '../getStrokeSideEditChange';

describe('getStrokeSideEditChange', () => {
  it('should turn an All stroke into Custom before writing the side', () => {
    // action
    const change = getStrokeSideEditChange({ strokeSides: StrokeSides.all, strokeWidth: 5 }, 'top', 2);

    // result
    expect(change).toEqual({
      strokeBottomWidth: 5,
      strokeLeftWidth: 5,
      strokeRightWidth: 5,
      strokeSides: StrokeSides.custom,
      strokeTopWidth: 2,
      strokeWidth: 5,
    });
  });

  it('should only write the side of a stroke that is already Custom', () => {
    // action
    const change = getStrokeSideEditChange(
      { strokeBottomWidth: 1, strokeLeftWidth: 1, strokeRightWidth: 1, strokeSides: StrokeSides.custom, strokeTopWidth: 1, strokeWidth: 1 },
      'left',
      3,
    );

    // result
    expect(change).toEqual({ strokeLeftWidth: 3, strokeWidth: 3 });
  });
});
