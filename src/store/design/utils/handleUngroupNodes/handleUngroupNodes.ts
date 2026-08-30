// types
import { TDesignState } from '../../types';

// utils
import { getActivePage } from '../getActivePage';
import { getUngroupableGroups } from './getUngroupableGroups';
import { releaseGroup } from './releaseGroup';

export const handleUngroupNodes = (state: TDesignState, groupIds: string[]): void => {
  const page = getActivePage(state);
  const groups = getUngroupableGroups(groupIds, page.nodes);
  const releasedIds = groups.flatMap((group) => releaseGroup(state, group));

  if (releasedIds.length > 0) {
    page.selectedIds = releasedIds;
  }
};
