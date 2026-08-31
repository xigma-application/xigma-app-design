// types
import { TDesignState } from '../../types';

// utils
import { deleteDegenerateDeselectedNodes } from './deleteDegenerateDeselectedNodes';
import { dropDescendantsOfSelected } from './dropDescendantsOfSelected';
import { dropTextPathGuides } from './dropTextPathGuides';
import { exitVectorEditingIfNeeded } from './exitVectorEditingIfNeeded';
import { getActivePage } from '../getActivePage';

export const handleSetSelection = (state: TDesignState, nextSelectedIds: string[]): void => {
  const page = getActivePage(state);
  const normalizedIds = dropTextPathGuides(dropDescendantsOfSelected(nextSelectedIds, page.nodes), page.nodes);
  const deselectedIds = page.selectedIds.filter((id) => !normalizedIds.includes(id));

  deleteDegenerateDeselectedNodes(state, deselectedIds);
  exitVectorEditingIfNeeded(state, normalizedIds);

  page.selectedIds = normalizedIds;
};
