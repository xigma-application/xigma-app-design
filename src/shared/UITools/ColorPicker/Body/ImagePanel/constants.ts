// types
import { TImageFillMode, TImagePanelState } from './types';

export const translationNameSpace = 'colorPicker.image';

export const ADJUSTMENT_SLIDER_MIN = -100;
export const ADJUSTMENT_SLIDER_MAX = 100;

export const DEFAULT_IMAGE_PANEL_STATE: TImagePanelState = {
  fillMode: 'fill',
  imageUrl: null,
};

export const UNSUPPORTED_IMAGE_MIME_TYPES = ['image/svg+xml'];

export const IMAGE_FILL_MODES: TImageFillMode[] = ['fill', 'fit', 'crop', 'tile'];
