// others
import { DEFAULT_VECTOR_PAINT, DEFAULT_VIEWPORT } from '../constants';

// types
import { TDesignPage, TDesignState } from '../types';

// utils
import { getNextPageName } from './getNextPageName';

export const handleAddPage = (state: TDesignState, id: string): void => {
  const newPage: TDesignPage = {
    backgroundPaint: state.pages[state.activePageId]?.backgroundPaint ?? null,
    comments: {},
    guides: [],
    id,
    name: getNextPageName(state.pages),
    nodes: {},
    paint: DEFAULT_VECTOR_PAINT,
    rootOrder: [],
    selectedFillIndices: [],
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
