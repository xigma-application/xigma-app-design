// types
import { LayoutGuideType } from 'types/design/enums';
import { TLayoutGuide } from 'types/design/types';

// utils
import { createLayoutGuide } from 'utils/design/layoutGuides/createLayoutGuide';
import { getLayoutGuidesWithVisibility } from '../getLayoutGuidesWithVisibility';

describe('getLayoutGuidesWithVisibility', () => {
  it('should hide a visible guide and show a hidden one', () => {
    // mock
    const guide: TLayoutGuide = createLayoutGuide(LayoutGuideType.grid);

    // result
    expect(getLayoutGuidesWithVisibility([guide], 0, false)[0].visible).toBe(false);
    expect(getLayoutGuidesWithVisibility([{ ...guide, visible: false }], 0, true)[0].visible).toBeUndefined();
  });
});
