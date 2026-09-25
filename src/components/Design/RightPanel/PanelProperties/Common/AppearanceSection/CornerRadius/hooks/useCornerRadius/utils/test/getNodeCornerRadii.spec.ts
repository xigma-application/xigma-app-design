// types
import { TAppearanceNode } from '../../../../../types';

// utils
import { getNodeCornerRadii } from '../getNodeCornerRadii';

describe('getNodeCornerRadii', () => {
  it('should fall back to the base radius for corners without their own', () => {
    // before
    const result = getNodeCornerRadii({ cornerRadius: 4, cornerRadiusTopLeft: 10 } as TAppearanceNode);

    // result
    expect(result).toEqual({ cornerRadiusBottomLeft: 4, cornerRadiusBottomRight: 4, cornerRadiusTopLeft: 10, cornerRadiusTopRight: 4 });
  });

  it('should return zeros without a node', () => {
    // result
    expect(getNodeCornerRadii(undefined)).toEqual({
      cornerRadiusBottomLeft: 0,
      cornerRadiusBottomRight: 0,
      cornerRadiusTopLeft: 0,
      cornerRadiusTopRight: 0,
    });
  });
});
