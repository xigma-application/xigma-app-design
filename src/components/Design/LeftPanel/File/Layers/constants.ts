// hooks
import { TResizeHandlerSettings } from 'hooks';

// others
import { translationNameSpace as parentNameSpace } from '../constants';

export const translationNameSpace = `${parentNameSpace}.layers`;

export const LAYERS_TITLE_KEY = `${translationNameSpace}.title`;
export const NODE_ROW_HIDE_ARIA_LABEL_KEY = `${translationNameSpace}.hideAriaLabel`;
export const NODE_ROW_LOCK_ARIA_LABEL_KEY = `${translationNameSpace}.lockAriaLabel`;
export const NODE_ROW_SHOW_ARIA_LABEL_KEY = `${translationNameSpace}.showAriaLabel`;
export const NODE_ROW_UNLOCK_ARIA_LABEL_KEY = `${translationNameSpace}.unlockAriaLabel`;

export const LAYERS_TREE_MIN_HEIGHT = 88;
export const LAYERS_TREE_DEFAULT_HEIGHT = 160;
export const LAYERS_TREE_TOP_OFFSET = 98;
export const LAYERS_TREE_BOTTOM_MARGIN = 150;
export const LAYERS_TREE_ROW_HEIGHT = 32;

export const LAYERS_TREE_RESIZE_SETTINGS: Omit<TResizeHandlerSettings, 'maxHeight'> = {
  initialHeight: LAYERS_TREE_DEFAULT_HEIGHT,
  initialWidth: 0,
  isInitiallyInvertedX: false,
  isInitiallyInvertedY: false,
  maxWidth: 0,
  minHeight: LAYERS_TREE_MIN_HEIGHT,
  minWidth: 0,
};
