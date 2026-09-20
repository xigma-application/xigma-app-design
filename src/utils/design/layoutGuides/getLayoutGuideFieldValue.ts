// others
import {
  DEFAULT_LAYOUT_GUIDE_COUNT,
  DEFAULT_LAYOUT_GUIDE_GRID_SIZE,
  DEFAULT_LAYOUT_GUIDE_GUTTER,
  DEFAULT_LAYOUT_GUIDE_MARGIN,
  DEFAULT_LAYOUT_GUIDE_SECTION_SIZE,
} from 'constant/layoutGuide';

// types
import { TLayoutGuide } from 'types/design/types';

const DEFAULTS: Record<TLayoutGuideNumberField, number> = {
  count: DEFAULT_LAYOUT_GUIDE_COUNT,
  gutter: DEFAULT_LAYOUT_GUIDE_GUTTER,
  height: DEFAULT_LAYOUT_GUIDE_SECTION_SIZE,
  margin: DEFAULT_LAYOUT_GUIDE_MARGIN,
  size: DEFAULT_LAYOUT_GUIDE_GRID_SIZE,
  width: DEFAULT_LAYOUT_GUIDE_SECTION_SIZE,
};

export type TLayoutGuideNumberField = 'count' | 'gutter' | 'height' | 'margin' | 'size' | 'width';

export const getLayoutGuideFieldValue = (guide: TLayoutGuide, field: TLayoutGuideNumberField): number => guide[field] ?? DEFAULTS[field];
