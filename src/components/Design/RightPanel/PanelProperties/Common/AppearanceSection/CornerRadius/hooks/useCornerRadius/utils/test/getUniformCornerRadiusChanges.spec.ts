// utils
import { getUniformCornerRadiusChanges } from '../getUniformCornerRadiusChanges';

describe('getUniformCornerRadiusChanges', () => {
  it('should set every corner to the value', () => {
    // result
    expect(getUniformCornerRadiusChanges(8)).toEqual({
      cornerRadius: 8,
      cornerRadiusBottomLeft: 8,
      cornerRadiusBottomRight: 8,
      cornerRadiusTopLeft: 8,
      cornerRadiusTopRight: 8,
    });
  });
});
