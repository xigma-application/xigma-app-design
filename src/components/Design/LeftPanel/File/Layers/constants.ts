// hooks
import { TResizeHandlerSettings } from 'hooks';

// others
import { translationNameSpace as parentNameSpace } from '../constants';

export const translationNameSpace = `${parentNameSpace}.layers`;

export const LAYERS_TITLE_KEY = `${translationNameSpace}.title`;
export const LAYERS_COLLAPSE_ALL_ARIA_LABEL_KEY = `${translationNameSpace}.collapseAllAriaLabel`;
export const NODE_MENU_ADD_AUTO_LAYOUT_KEY = `${translationNameSpace}.menu.addAutoLayout`;
export const NODE_MENU_ADD_MOTION_KEY = `${translationNameSpace}.menu.addMotion`;
export const NODE_MENU_BRING_TO_FRONT_KEY = `${translationNameSpace}.menu.bringToFront`;
export const NODE_MENU_COPY_KEY = `${translationNameSpace}.menu.copy`;
export const NODE_MENU_COPY_PASTE_AS_KEY = `${translationNameSpace}.menu.copyPasteAs`;
export const NODE_MENU_CREATE_COMPONENT_KEY = `${translationNameSpace}.menu.createComponent`;
export const NODE_MENU_FLATTEN_KEY = `${translationNameSpace}.menu.flatten`;
export const NODE_MENU_FLIP_HORIZONTAL_KEY = `${translationNameSpace}.menu.flipHorizontal`;
export const NODE_MENU_FLIP_VERTICAL_KEY = `${translationNameSpace}.menu.flipVertical`;
export const NODE_MENU_FRAME_SELECTION_KEY = `${translationNameSpace}.menu.frameSelection`;
export const NODE_MENU_GROUP_SELECTION_KEY = `${translationNameSpace}.menu.groupSelection`;
export const NODE_MENU_MOVE_TO_PAGE_KEY = `${translationNameSpace}.menu.moveToPage`;
export const NODE_MENU_OUTLINE_STROKE_KEY = `${translationNameSpace}.menu.outlineStroke`;
export const NODE_MENU_PASTE_TO_REPLACE_KEY = `${translationNameSpace}.menu.pasteToReplace`;
export const NODE_MENU_PLUGINS_KEY = `${translationNameSpace}.menu.plugins`;
export const NODE_MENU_RENAME_KEY = `${translationNameSpace}.menu.rename`;
export const NODE_MENU_SEND_TO_BACK_KEY = `${translationNameSpace}.menu.sendToBack`;
export const NODE_MENU_SEND_TO_MAKE_KEY = `${translationNameSpace}.menu.sendToMake`;
export const NODE_MENU_USE_AS_MASK_KEY = `${translationNameSpace}.menu.useAsMask`;
export const NODE_MENU_WIDGETS_KEY = `${translationNameSpace}.menu.widgets`;
export const NODE_ROW_COLLAPSE_ARIA_LABEL_KEY = `${translationNameSpace}.collapseAriaLabel`;
export const NODE_ROW_EXPAND_ARIA_LABEL_KEY = `${translationNameSpace}.expandAriaLabel`;
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
