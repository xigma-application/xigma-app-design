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
  const selectionChanged =
    normalizedIds.length !== page.selectedIds.length || normalizedIds.some((id, index) => id !== page.selectedIds[index]);

  deleteDegenerateDeselectedNodes(state, deselectedIds);
  exitVectorEditingIfNeeded(state, normalizedIds);

  if (selectionChanged) {
    state.revealedMinMax = { maxHeight: false, maxWidth: false, minHeight: false, minWidth: false };
    state.hoveredDimensionField = null;
  }

  page.selectedIds = normalizedIds;
};
