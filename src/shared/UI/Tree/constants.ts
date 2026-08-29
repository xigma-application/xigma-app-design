// hooks
import { TResizeHandlerSettings } from 'hooks';

export const TREE_MIN_HEIGHT = 88;
export const TREE_DEFAULT_HEIGHT = 160;
export const TREE_TOP_OFFSET = 98;
export const TREE_BOTTOM_MARGIN = 150;
export const TREE_ROW_HEIGHT = 32;

export const TREE_RESIZE_SETTINGS: Omit<TResizeHandlerSettings, 'maxHeight'> = {
  initialHeight: TREE_DEFAULT_HEIGHT,
  initialWidth: 0,
  isInitiallyInvertedX: false,
  isInitiallyInvertedY: false,
  maxWidth: 0,
  minHeight: TREE_MIN_HEIGHT,
  minWidth: 0,
};
