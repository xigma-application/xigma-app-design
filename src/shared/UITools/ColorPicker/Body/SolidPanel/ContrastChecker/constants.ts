// others
import { translationNameSpace as parentNameSpace } from '../../../constants';

// types
import { ContrastCategory, ContrastLevel } from './enums';
import { TContrastCheckerState } from './types';

export const translationNameSpace = `${parentNameSpace}.contrastChecker`;

export const CONTRAST_THRESHOLDS: Record<
  Exclude<ContrastCategory, ContrastCategory.auto>,
  { [ContrastLevel.aa]: number; [ContrastLevel.aaa]?: number }
> = {
  [ContrastCategory.graphics]: { [ContrastLevel.aa]: 3 },
  [ContrastCategory.largeText]: { [ContrastLevel.aa]: 3, [ContrastLevel.aaa]: 4.5 },
  [ContrastCategory.normalText]: { [ContrastLevel.aa]: 4.5, [ContrastLevel.aaa]: 7 },
};

export const DEFAULT_CONTRAST_CHECKER_STATE: TContrastCheckerState = {
  category: ContrastCategory.auto,
  isActive: false,
  level: ContrastLevel.aa,
};
