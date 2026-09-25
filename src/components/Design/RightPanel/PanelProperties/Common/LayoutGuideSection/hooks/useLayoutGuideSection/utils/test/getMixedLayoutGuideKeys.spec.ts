// types
import { LayoutGuideColumnsAlign, LayoutGuideType } from 'types/design/enums';
import { TLayoutGuide } from 'types/design/types';

// utils
import { createLayoutGuide } from 'utils/design/layoutGuides/createLayoutGuide';
import { getMixedLayoutGuideKeys } from '../getMixedLayoutGuideKeys';

describe('getMixedLayoutGuideKeys', () => {
  it('should report only the keys whose effective values differ, treating defaults as set', () => {
    // mock
    const guide = createLayoutGuide(LayoutGuideType.columns);
    const other: TLayoutGuide = { ...guide, columnsAlign: undefined, count: 9 };

    // before
    const keys = getMixedLayoutGuideKeys([guide, { ...other, columnsAlign: LayoutGuideColumnsAlign.stretch }]);

    // result
    expect([...keys]).toEqual(['count']);
  });
});
