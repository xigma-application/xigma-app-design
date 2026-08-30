// types
import { TDesignState } from '../types';

// utils
import { getActivePage } from './getActivePage';
import { getSelectionOrderScopes } from './getSelectionOrderScopes';
import { moveIdsToEdge } from './moveIdsToEdge';

export const handleBringSelectionToFront = (state: TDesignState): void => {
  const page = getActivePage(state);
  const selectedIds = new Set(page.selectedIds);

  getSelectionOrderScopes(page).forEach((order) => moveIdsToEdge(order, selectedIds, 'end'));
};
