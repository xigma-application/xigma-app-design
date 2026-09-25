// types
import { TAppearanceNode } from '../../../../../types';

// utils
import { getNodeMergedCornerRadius } from '../getNodeMergedCornerRadius';

describe('getNodeMergedCornerRadius', () => {
  it('should return the radius shared by every corner', () => {
    // result
    expect(getNodeMergedCornerRadius({ cornerRadius: 6 } as TAppearanceNode)).toBe(6);
  });

  it('should return mixed when a corner differs', () => {
    // result
    expect(getNodeMergedCornerRadius({ cornerRadius: 6, cornerRadiusTopLeft: 2 } as TAppearanceNode)).toBe('mixed');
  });
});
