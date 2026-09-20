// types
import { LayoutGuideRowsAlign, LayoutGuideType } from 'types/design/enums';
import { TLayoutGuide } from 'types/design/types';

// utils
import { getLayoutGuideRowsAlign } from '../getLayoutGuideRowsAlign';

describe('getLayoutGuideRowsAlign', () => {
  it('should return the stored align', () => {
    // mock
    const guide: TLayoutGuide = { color: '#FF0000', opacity: 10, rowsAlign: LayoutGuideRowsAlign.top, type: LayoutGuideType.rows };

    // result
    expect(getLayoutGuideRowsAlign(guide)).toBe(LayoutGuideRowsAlign.top);
  });

  it('should default to stretch when unset', () => {
    // mock
    const guide: TLayoutGuide = { color: '#FF0000', opacity: 10, type: LayoutGuideType.rows };

    // result
    expect(getLayoutGuideRowsAlign(guide)).toBe(LayoutGuideRowsAlign.stretch);
  });
});
