// types
import { LayoutGuideType } from 'types/design/enums';
import { TLayoutGuide } from 'types/design/types';

// utils
import { getLayoutGuideFieldValue } from '../getLayoutGuideFieldValue';

const guide: TLayoutGuide = { color: '#FF0000', opacity: 10, type: LayoutGuideType.grid };

describe('getLayoutGuideFieldValue', () => {
  it('should return the stored value when set', () => {
    // result
    expect(getLayoutGuideFieldValue({ ...guide, count: 8 }, 'count')).toBe(8);
  });

  it('should fall back to the field default when unset', () => {
    // result
    expect(getLayoutGuideFieldValue(guide, 'count')).toBe(5);
    expect(getLayoutGuideFieldValue(guide, 'gutter')).toBe(20);
    expect(getLayoutGuideFieldValue(guide, 'margin')).toBe(0);
    expect(getLayoutGuideFieldValue(guide, 'size')).toBe(10);
    expect(getLayoutGuideFieldValue(guide, 'width')).toBe(100);
    expect(getLayoutGuideFieldValue(guide, 'height')).toBe(100);
  });
});
