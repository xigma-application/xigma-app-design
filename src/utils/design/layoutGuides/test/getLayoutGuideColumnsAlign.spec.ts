// types
import { LayoutGuideColumnsAlign, LayoutGuideType } from 'types/design/enums';
import { TLayoutGuide } from 'types/design/types';

// utils
import { getLayoutGuideColumnsAlign } from '../getLayoutGuideColumnsAlign';

describe('getLayoutGuideColumnsAlign', () => {
  it('should return the stored align', () => {
    // mock
    const guide: TLayoutGuide = {
      color: '#FF0000',
      columnsAlign: LayoutGuideColumnsAlign.left,
      opacity: 10,
      type: LayoutGuideType.columns,
    };

    // result
    expect(getLayoutGuideColumnsAlign(guide)).toBe(LayoutGuideColumnsAlign.left);
  });

  it('should default to stretch when unset', () => {
    // mock
    const guide: TLayoutGuide = { color: '#FF0000', opacity: 10, type: LayoutGuideType.columns };

    // result
    expect(getLayoutGuideColumnsAlign(guide)).toBe(LayoutGuideColumnsAlign.stretch);
  });
});
