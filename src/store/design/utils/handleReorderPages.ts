// types
import { TDesignPage, TDesignState, TReorderPayload } from '../types';

export const handleReorderPages = (state: TDesignState, { fromIndex, toIndex }: TReorderPayload): void => {
  const orderedIds = Object.keys(state.pages);
  const [movedId] = orderedIds.splice(fromIndex, 1);

  if (movedId) {
    orderedIds.splice(toIndex, 0, movedId);

    state.pages = orderedIds.reduce<Record<string, TDesignPage>>((pages, pageId) => {
      pages[pageId] = state.pages[pageId];

      return pages;
    }, {});
  }
};
