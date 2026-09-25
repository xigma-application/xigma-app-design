// types
import { LayoutGuideType } from 'types/design/enums';

// utils
import { createLayoutGuide } from 'utils/design/layoutGuides/createLayoutGuide';
import { getLayoutGuidesWithScrub } from '../getLayoutGuidesWithScrub';

describe('getLayoutGuidesWithScrub', () => {
  it('should scrub a guide its own value by the delta from the shown guide, clamped to the minimum', () => {
    // mock
    const base = { ...createLayoutGuide(LayoutGuideType.columns), count: 4 };
    const guides = [
      { ...base, count: 10 },
      { ...base, count: 1 },
    ];

    // before
    const [first] = getLayoutGuidesWithScrub(guides, 0, base, 'count', 1, 6);
    const [, second] = getLayoutGuidesWithScrub(guides, 1, base, 'count', 1, 0);

    // result
    expect(first.count).toBe(12);
    expect(second.count).toBe(1);
  });

  it('should leave the guide as it is when the value is not a number', () => {
    // mock
    const base = createLayoutGuide(LayoutGuideType.columns);
    const guides = [{ ...base, gutter: Number.NaN }];

    // result
    expect(getLayoutGuidesWithScrub(guides, 0, base, 'gutter', 0, 1)[0]).toEqual(guides[0]);
  });
});
