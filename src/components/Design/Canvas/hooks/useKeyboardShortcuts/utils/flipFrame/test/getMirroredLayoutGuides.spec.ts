// types
import { LayoutGuideColumnsAlign, LayoutGuideRowsAlign, LayoutGuideType } from 'types/design/enums';
import { TLayoutGuide } from 'types/design/types';

// utils
import { getMirroredLayoutGuides } from '../getMirroredLayoutGuides';

const guide = (extra: Partial<TLayoutGuide>): TLayoutGuide => ({ color: '#f00', opacity: 10, type: LayoutGuideType.columns, ...extra });

describe('getMirroredLayoutGuides', () => {
  it('should mirror the columns alignment for a horizontal flip', () => {
    // result
    expect(getMirroredLayoutGuides([guide({ columnsAlign: LayoutGuideColumnsAlign.left }), guide({})], 'horizontal')).toEqual([
      guide({ columnsAlign: LayoutGuideColumnsAlign.right }),
      guide({ columnsAlign: undefined }),
    ]);
  });

  it('should mirror the rows alignment for a vertical flip', () => {
    // result
    expect(getMirroredLayoutGuides([guide({ rowsAlign: LayoutGuideRowsAlign.top }), guide({})], 'vertical')).toEqual([
      guide({ rowsAlign: LayoutGuideRowsAlign.bottom }),
      guide({ rowsAlign: undefined }),
    ]);
  });

  it('should return nothing without layout guides', () => {
    // result
    expect(getMirroredLayoutGuides(undefined, 'horizontal')).toBeUndefined();
  });
});
