import { TFunction } from 'i18next';

// types
import { LayoutGuideType } from 'types/design/enums';
import { TLayoutGuide } from 'types/design/types';

// others
import { translationNameSpace } from '../../constants';

// utils
import { getLayoutGuideFieldValue } from 'utils/design/layoutGuides/getLayoutGuideFieldValue';

export const getLayoutGuideRowLabel = (guide: TLayoutGuide, t: TFunction): string => {
  switch (guide.type) {
    case LayoutGuideType.columns:
      return t(`${translationNameSpace}.row.columnsLabel`, { count: getLayoutGuideFieldValue(guide, 'count') });
    case LayoutGuideType.rows:
      return t(`${translationNameSpace}.row.rowsLabel`, { count: getLayoutGuideFieldValue(guide, 'count') });
    default:
      return t(`${translationNameSpace}.row.gridLabel`, { size: getLayoutGuideFieldValue(guide, 'size') });
  }
};
