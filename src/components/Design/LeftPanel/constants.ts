// hooks
import { TResizeHandlerSettings } from 'hooks';

// others
import { translationNameSpace as parentNameSpace } from '../constants';

export const translationNameSpace = `${parentNameSpace}.leftPanel`;

export const LEFT_PANEL_DEFAULT_WIDTH = 500;
export const LEFT_PANEL_MAX_WIDTH = 500;
export const LEFT_PANEL_MIN_WIDTH = 297;

export const LEFT_PANEL_RESIZE_SETTINGS: TResizeHandlerSettings = {
  initialHeight: 0,
  initialWidth: LEFT_PANEL_DEFAULT_WIDTH,
  isInitiallyInvertedX: false,
  isInitiallyInvertedY: false,
  maxHeight: 0,
  maxWidth: LEFT_PANEL_MAX_WIDTH,
  minHeight: 0,
  minWidth: LEFT_PANEL_MIN_WIDTH,
};
