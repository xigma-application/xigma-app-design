// types
import { LayoutGuideColumnsAlign, LayoutGuideRowsAlign, LayoutGuideType } from 'types/design/enums';
import { TLayoutGuide } from 'types/design/types';

// utils
import { createLayoutGuide } from 'utils/design/layoutGuides/createLayoutGuide';
import { isLayoutGuideStretchedOnAny } from '../isLayoutGuideStretchedOnAny';

describe('isLayoutGuideStretchedOnAny', () => {
  it('should report a stretched columns or rows guide', () => {
    // mock
    const columns: TLayoutGuide = {
      ...createLayoutGuide(LayoutGuideType.columns),
      columnsAlign: LayoutGuideColumnsAlign.left,
      rowsAlign: LayoutGuideRowsAlign.stretch,
    };

    // result
    expect(isLayoutGuideStretchedOnAny([columns])).toBe(true);
    expect(
      isLayoutGuideStretchedOnAny([{ ...columns, columnsAlign: LayoutGuideColumnsAlign.stretch, rowsAlign: LayoutGuideRowsAlign.top }]),
    ).toBe(true);
  });

  it('should not report guides aligned on both axes', () => {
    // mock
    const guide: TLayoutGuide = {
      ...createLayoutGuide(LayoutGuideType.grid),
      columnsAlign: LayoutGuideColumnsAlign.left,
      rowsAlign: LayoutGuideRowsAlign.top,
    };

    // result
    expect(isLayoutGuideStretchedOnAny([guide])).toBe(false);
    expect(isLayoutGuideStretchedOnAny([])).toBe(false);
  });
});
