// types
import { TDesignPage, TDesignState } from '../types';

export const handleDeletePage = (state: TDesignState, id: string): void => {
  const orderedIds = Object.keys(state.pages);

  if (orderedIds.length <= 1 || !state.pages[id]) {
    return;
  }

  const removedIndex = orderedIds.indexOf(id);
  const remainingIds = orderedIds.filter((pageId) => pageId !== id);

  state.pages = remainingIds.reduce<Record<string, TDesignPage>>((pages, pageId) => {
    pages[pageId] = state.pages[pageId];

    return pages;
  }, {});

  if (state.activePageId === id) {
    state.activePageId = remainingIds[Math.max(0, removedIndex - 1)];
  }
};
