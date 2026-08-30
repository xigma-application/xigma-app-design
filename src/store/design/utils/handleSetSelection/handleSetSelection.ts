// types
import { TDesignState } from '../../types';

// utils
import { deleteDegenerateDeselectedNodes } from './deleteDegenerateDeselectedNodes';
import { dropDescendantsOfSelected } from './dropDescendantsOfSelected';
import { exitVectorEditingIfNeeded } from './exitVectorEditingIfNeeded';
import { getActivePage } from '../getActivePage';

export const handleSetSelection = (state: TDesignState, nextSelectedIds: string[]): void => {
  const page = getActivePage(state);
  const normalizedIds = dropDescendantsOfSelected(nextSelectedIds, page.nodes);
  const deselectedIds = page.selectedIds.filter((id) => !normalizedIds.includes(id));

  deleteDegenerateDeselectedNodes(state, deselectedIds);
  exitVectorEditingIfNeeded(state, normalizedIds);

  page.selectedIds = normalizedIds;
};
