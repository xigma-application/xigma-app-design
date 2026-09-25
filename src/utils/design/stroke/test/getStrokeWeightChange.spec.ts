// types
import { StrokeSides } from 'types/design/enums';

// utils
import { getStrokeWeightChange } from '../getStrokeWeightChange';

describe('getStrokeWeightChange', () => {
  it('should set every side width along with the weight for custom sides', () => {
    // result
    expect(getStrokeWeightChange({ strokeSides: StrokeSides.custom }, 4)).toEqual({
      strokeBottomWidth: 4,
      strokeLeftWidth: 4,
      strokeRightWidth: 4,
      strokeTopWidth: 4,
      strokeWidth: 4,
    });
  });

  it('should set only the weight otherwise', () => {
    // result
    expect(getStrokeWeightChange({ strokeSides: StrokeSides.all }, 4)).toEqual({ strokeWidth: 4 });
  });
});
