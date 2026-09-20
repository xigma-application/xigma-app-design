// types
import { LayoutGuideRowsAlign } from 'types/design/enums';

// utils
import { getLayoutGuideRowsAlignOptions } from '../getLayoutGuideRowsAlignOptions';

describe('getLayoutGuideRowsAlignOptions', () => {
  it('should list top, bottom, center and stretch in that order', () => {
    // action
    const options = getLayoutGuideRowsAlignOptions((align) => align);

    // result
    expect(options).toEqual([
      { label: LayoutGuideRowsAlign.top, value: LayoutGuideRowsAlign.top },
      { label: LayoutGuideRowsAlign.bottom, value: LayoutGuideRowsAlign.bottom },
      { label: LayoutGuideRowsAlign.center, value: LayoutGuideRowsAlign.center },
      { label: LayoutGuideRowsAlign.stretch, value: LayoutGuideRowsAlign.stretch },
    ]);
  });
});
