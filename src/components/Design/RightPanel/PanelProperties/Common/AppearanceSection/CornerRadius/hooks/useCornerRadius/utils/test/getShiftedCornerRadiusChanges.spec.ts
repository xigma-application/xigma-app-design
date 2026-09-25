// types
import { TAppearanceNode } from '../../../../../types';

// utils
import { getShiftedCornerRadiusChanges } from '../getShiftedCornerRadiusChanges';

describe('getShiftedCornerRadiusChanges', () => {
  it('should shift every corner by the delta and clamp at zero', () => {
    // before
    const result = getShiftedCornerRadiusChanges({ cornerRadius: 4, cornerRadiusTopLeft: 10 } as TAppearanceNode, -6);

    // result
    expect(result).toEqual({
      cornerRadius: 0,
      cornerRadiusBottomLeft: 0,
      cornerRadiusBottomRight: 0,
      cornerRadiusTopLeft: 4,
      cornerRadiusTopRight: 0,
    });
  });

  it('should treat a missing base radius as zero', () => {
    // result
    expect(getShiftedCornerRadiusChanges({} as TAppearanceNode, 3).cornerRadius).toBe(3);
  });
});
