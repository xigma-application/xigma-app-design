// types
import { TSelectionColorGroup } from '../types';

// others
import { MAX_SELECTION_COLOR_PREVIEW } from '../constants';

export type TSelectionColorPreview = { overflowCount: number; visibleGroups: TSelectionColorGroup[] };

export const getSelectionColorPreview = (groups: TSelectionColorGroup[]): TSelectionColorPreview => ({
  overflowCount: Math.max(0, groups.length - MAX_SELECTION_COLOR_PREVIEW),
  visibleGroups: groups.slice(0, MAX_SELECTION_COLOR_PREVIEW),
});
