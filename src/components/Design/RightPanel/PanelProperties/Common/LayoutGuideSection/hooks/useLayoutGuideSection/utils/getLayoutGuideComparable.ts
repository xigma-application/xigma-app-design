// types
import { TLayoutGuide } from 'types/design/types';

// utils
import { getLayoutGuideColumnsAlign } from 'utils/design/layoutGuides/getLayoutGuideColumnsAlign';
import { getLayoutGuideFieldValue } from 'utils/design/layoutGuides/getLayoutGuideFieldValue';
import { getLayoutGuideRowsAlign } from 'utils/design/layoutGuides/getLayoutGuideRowsAlign';

export const getLayoutGuideComparable = (guide: TLayoutGuide): TLayoutGuide => ({
  ...guide,
  columnsAlign: getLayoutGuideColumnsAlign(guide),
  count: getLayoutGuideFieldValue(guide, 'count'),
  gutter: getLayoutGuideFieldValue(guide, 'gutter'),
  height: getLayoutGuideFieldValue(guide, 'height'),
  margin: getLayoutGuideFieldValue(guide, 'margin'),
  rowsAlign: getLayoutGuideRowsAlign(guide),
  size: getLayoutGuideFieldValue(guide, 'size'),
  visible: guide.visible !== false,
  width: getLayoutGuideFieldValue(guide, 'width'),
});
