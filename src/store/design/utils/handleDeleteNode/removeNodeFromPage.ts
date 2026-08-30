// types
import { TDesignState } from '../../types';

// utils
import { getActivePage } from '../getActivePage';

export const removeNodeFromPage = (state: TDesignState, id: string): void => {
  const page = getActivePage(state);

  delete page.nodes[id];
  page.rootOrder = page.rootOrder.filter((nodeId) => nodeId !== id);
  page.selectedIds = page.selectedIds.filter((nodeId) => nodeId !== id);
};
