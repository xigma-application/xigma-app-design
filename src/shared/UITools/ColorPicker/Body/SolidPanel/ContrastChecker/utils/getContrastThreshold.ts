// others
import { CONTRAST_THRESHOLDS } from '../constants';

// types
import { ContrastCategory, ContrastLevel } from '../enums';

export const getContrastThreshold = (category: ContrastCategory, level: ContrastLevel): number => {
  const resolvedCategory = category === ContrastCategory.auto ? ContrastCategory.graphics : category;
  const thresholds = CONTRAST_THRESHOLDS[resolvedCategory];

  return thresholds[level] ?? thresholds[ContrastLevel.aa];
};
