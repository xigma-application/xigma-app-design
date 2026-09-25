// types
import { LayoutGuideColumnsAlign, LayoutGuideRowsAlign, LayoutGuideType } from 'types/design/enums';
import { TLayoutGuide } from 'types/design/types';

// utils
import { createLayoutGuide } from 'utils/design/layoutGuides/createLayoutGuide';
import { getLayoutGuideComparable } from '../getLayoutGuideComparable';

describe('getLayoutGuideComparable', () => {
  it('should fill the default aligns and visibility', () => {
    // mock
    const guide: TLayoutGuide = { color: '#ff0000', opacity: 10, type: LayoutGuideType.grid };

    // before
    const result = getLayoutGuideComparable(guide);

    // result
    expect(result).toMatchObject({ columnsAlign: LayoutGuideColumnsAlign.stretch, rowsAlign: LayoutGuideRowsAlign.stretch, visible: true });
  });

  it('should keep a hidden guide hidden and its own values', () => {
    // mock
    const guide = { ...createLayoutGuide(LayoutGuideType.columns), count: 12, visible: false };

    // result
    expect(getLayoutGuideComparable(guide)).toMatchObject({ count: 12, visible: false });
  });
});
