// others
import {
  DEFAULT_LAYOUT_GUIDE_COLOR,
  DEFAULT_LAYOUT_GUIDE_COUNT,
  DEFAULT_LAYOUT_GUIDE_GRID_SIZE,
  DEFAULT_LAYOUT_GUIDE_GUTTER,
  DEFAULT_LAYOUT_GUIDE_MARGIN,
  DEFAULT_LAYOUT_GUIDE_OPACITY,
} from 'constant/layoutGuide';

// types
import { LayoutGuideColumnsAlign, LayoutGuideRowsAlign, LayoutGuideType } from 'types/design/enums';
import { TLayoutGuide } from 'types/design/types';

const createBaseLayoutGuide = (type: LayoutGuideType): TLayoutGuide => ({
  color: DEFAULT_LAYOUT_GUIDE_COLOR,
  opacity: DEFAULT_LAYOUT_GUIDE_OPACITY,
  type,
});

export const createLayoutGuide = (type: LayoutGuideType): TLayoutGuide => {
  switch (type) {
    case LayoutGuideType.columns:
      return {
        ...createBaseLayoutGuide(type),
        columnsAlign: LayoutGuideColumnsAlign.stretch,
        count: DEFAULT_LAYOUT_GUIDE_COUNT,
        gutter: DEFAULT_LAYOUT_GUIDE_GUTTER,
        margin: DEFAULT_LAYOUT_GUIDE_MARGIN,
      };
    case LayoutGuideType.rows:
      return {
        ...createBaseLayoutGuide(type),
        count: DEFAULT_LAYOUT_GUIDE_COUNT,
        gutter: DEFAULT_LAYOUT_GUIDE_GUTTER,
        margin: DEFAULT_LAYOUT_GUIDE_MARGIN,
        rowsAlign: LayoutGuideRowsAlign.stretch,
      };
    default:
      return { ...createBaseLayoutGuide(type), size: DEFAULT_LAYOUT_GUIDE_GRID_SIZE };
  }
};
