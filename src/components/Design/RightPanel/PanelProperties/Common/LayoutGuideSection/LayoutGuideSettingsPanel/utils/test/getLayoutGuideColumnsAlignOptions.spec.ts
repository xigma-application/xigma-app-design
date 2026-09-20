// types
import { LayoutGuideColumnsAlign } from 'types/design/enums';

// utils
import { getLayoutGuideColumnsAlignOptions } from '../getLayoutGuideColumnsAlignOptions';

describe('getLayoutGuideColumnsAlignOptions', () => {
  it('should list left, right, center and stretch in that order', () => {
    // action
    const options = getLayoutGuideColumnsAlignOptions((align) => align);

    // result
    expect(options).toEqual([
      { label: LayoutGuideColumnsAlign.left, value: LayoutGuideColumnsAlign.left },
      { label: LayoutGuideColumnsAlign.right, value: LayoutGuideColumnsAlign.right },
      { label: LayoutGuideColumnsAlign.center, value: LayoutGuideColumnsAlign.center },
      { label: LayoutGuideColumnsAlign.stretch, value: LayoutGuideColumnsAlign.stretch },
    ]);
  });
});
