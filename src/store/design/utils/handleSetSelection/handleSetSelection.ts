// types
import { TDesignState } from '../../types';

// utils
import { deleteDegenerateDeselectedNodes } from './deleteDegenerateDeselectedNodes';
import { exitVectorEditingIfNeeded } from './exitVectorEditingIfNeeded';
import { getActivePage } from '../getActivePage';

export const handleSetSelection = (state: TDesignState, nextSelectedIds: string[]): void => {
  const page = getActivePage(state);
  const deselectedIds = page.selectedIds.filter((id) => !nextSelectedIds.includes(id));

  deleteDegenerateDeselectedNodes(state, deselectedIds);
  exitVectorEditingIfNeeded(state, nextSelectedIds);

  page.selectedIds = nextSelectedIds;
};
