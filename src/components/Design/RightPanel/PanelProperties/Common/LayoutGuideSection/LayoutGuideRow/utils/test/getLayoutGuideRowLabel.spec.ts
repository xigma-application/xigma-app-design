import { TFunction } from 'i18next';

// types
import { LayoutGuideType } from 'types/design/enums';
import { TLayoutGuide } from 'types/design/types';

// utils
import { getLayoutGuideRowLabel } from '../getLayoutGuideRowLabel';

const t = ((key: string, options?: Record<string, unknown>): string =>
  `${key}${options ? `:${JSON.stringify(options)}` : ''}`) as TFunction;

describe('getLayoutGuideRowLabel', () => {
  it('should include the size for a grid guide', () => {
    // mock
    const guide: TLayoutGuide = { color: '#FF0000', opacity: 10, size: 8, type: LayoutGuideType.grid };

    // result
    expect(getLayoutGuideRowLabel(guide, t)).toContain('"size":8');
  });

  it('should include the count for a columns guide', () => {
    // mock
    const guide: TLayoutGuide = { color: '#FF0000', count: 3, opacity: 10, type: LayoutGuideType.columns };

    // result
    expect(getLayoutGuideRowLabel(guide, t)).toContain('"count":3');
  });

  it('should include the count for a rows guide', () => {
    // mock
    const guide: TLayoutGuide = { color: '#FF0000', count: 7, opacity: 10, type: LayoutGuideType.rows };

    // result
    expect(getLayoutGuideRowLabel(guide, t)).toContain('"count":7');
  });
});
