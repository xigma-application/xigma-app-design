// hooks
import { TResizeHandlerSettings } from 'hooks';

// others
import { translationNameSpace as parentNameSpace } from '../constants';

export const translationNameSpace = `${parentNameSpace}.rightPanel`;

export const RIGHT_PANEL_DEFAULT_WIDTH = 241;
export const RIGHT_PANEL_MAX_WIDTH = 500;
export const RIGHT_PANEL_MIN_WIDTH = 241;

export const RIGHT_PANEL_RESIZE_SETTINGS: TResizeHandlerSettings = {
  initialHeight: 0,
  initialWidth: RIGHT_PANEL_DEFAULT_WIDTH,
  isInitiallyInvertedX: true,
  isInitiallyInvertedY: false,
  maxHeight: 0,
  maxWidth: RIGHT_PANEL_MAX_WIDTH,
  minHeight: 0,
  minWidth: RIGHT_PANEL_MIN_WIDTH,
};
