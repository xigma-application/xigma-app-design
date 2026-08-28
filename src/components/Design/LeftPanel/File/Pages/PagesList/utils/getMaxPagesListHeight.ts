// others
import { PAGES_LIST_BOTTOM_MARGIN, PAGES_LIST_MIN_HEIGHT, PAGES_LIST_TOP_OFFSET } from '../constants';

export const getMaxPagesListHeight = (): number =>
  Math.max(window.innerHeight - PAGES_LIST_TOP_OFFSET - PAGES_LIST_BOTTOM_MARGIN, PAGES_LIST_MIN_HEIGHT);
