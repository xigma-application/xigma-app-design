// types
import { TDesignState } from '../../types';

// utils
import { getActivePage } from '../getActivePage';
import { getSelectionParentGroups } from './getSelectionParentGroups';

export const handleSelectionPerParent = (
  state: TDesignState,
  groupId: string,
  handle: (state: TDesignState, groupId: string) => void,
): void => {
  const page = getActivePage(state);
  const groups = getSelectionParentGroups(page);

  if (groups.length > 1) {
    page.selectedIds = groups.flatMap((ids, index) => {
      page.selectedIds = ids;
      handle(state, index === 0 ? groupId : `${groupId}-${index}`);

      return page.selectedIds;
    });
  } else {
    handle(state, groupId);
  }
};
