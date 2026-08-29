// others
import { DEFAULT_PAINT_COLOR, DEFAULT_VIEWPORT } from '../constants';

// types
import { TDesignPage, TDesignState } from '../types';

// utils
import { getNextPageName } from './getNextPageName';

export const handleAddPage = (state: TDesignState, id: string): void => {
  const newPage: TDesignPage = {
    comments: {},
    id,
    name: getNextPageName(state.pages),
    nodes: {},
    paintColor: DEFAULT_PAINT_COLOR,
    rootOrder: [],
    selectedIds: [],
    viewport: DEFAULT_VIEWPORT,
  };

  const orderedIds = Object.keys(state.pages);
  const insertAfter = orderedIds.indexOf(state.activePageId) + 1;
  const nextIds = [...orderedIds.slice(0, insertAfter), id, ...orderedIds.slice(insertAfter)];

  state.pages = nextIds.reduce<Record<string, TDesignPage>>((pages, pageId) => {
    pages[pageId] = pageId === id ? newPage : state.pages[pageId];
    return pages;
  }, {});
  state.activePageId = id;
};
