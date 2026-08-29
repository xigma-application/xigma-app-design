// hooks
import { TResizeHandlerSettings } from 'hooks';

export const PAGES_LIST_MIN_HEIGHT = 88;
export const PAGES_LIST_DEFAULT_HEIGHT = 120;
export const PAGES_LIST_TOP_OFFSET = 58;
export const PAGES_LIST_BOTTOM_MARGIN = 150;
export const PAGES_LIST_ROW_HEIGHT = 32;

export const PAGES_LIST_RESIZE_SETTINGS: Omit<TResizeHandlerSettings, 'maxHeight'> = {
  initialHeight: PAGES_LIST_DEFAULT_HEIGHT,
  initialWidth: 0,
  isInitiallyInvertedX: false,
  isInitiallyInvertedY: false,
  maxWidth: 0,
  minHeight: PAGES_LIST_MIN_HEIGHT,
  minWidth: 0,
};
