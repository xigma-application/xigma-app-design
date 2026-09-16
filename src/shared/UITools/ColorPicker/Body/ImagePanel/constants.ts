// types
import { TImagePanelState } from './types';

export const translationNameSpace = 'colorPicker.image';

export const ADJUSTMENT_SLIDER_MIN = -100;
export const ADJUSTMENT_SLIDER_MAX = 100;

export const DEFAULT_IMAGE_PANEL_STATE: TImagePanelState = {
  contrast: 0,
  exposure: 0,
  fillMode: 'fill',
  highlights: 0,
  imageUrl: null,
  saturation: 0,
  shadows: 0,
  temperature: 0,
  tint: 0,
};

export const UNSUPPORTED_IMAGE_MIME_TYPES = ['image/svg+xml'];
