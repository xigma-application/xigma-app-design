// types
import { TOpenSelectionColorGroup } from '../types';
import { TSelectionColorGroup } from '../../../types';

export const getNextOpenGroup = (
  currentOpenGroup: TOpenSelectionColorGroup | null,
  group: TSelectionColorGroup,
  isOpen: boolean,
): TOpenSelectionColorGroup | null => {
  switch (isOpen) {
    case true:
      return { key: group.key, occurrences: group.occurrences };
    default:
      return currentOpenGroup?.key === group.key ? null : currentOpenGroup;
  }
};
