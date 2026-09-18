// types
import { TAspectRatioTarget } from './types';

export const ASPECT_RATIO_ORIGINAL: TAspectRatioTarget = 'original';
export const ASPECT_RATIO_SQUARE: TAspectRatioTarget = { ratioHeight: 1, ratioWidth: 1 };
export const ASPECT_RATIO_CIRCLE: TAspectRatioTarget = { cornerRadius: 'max', ratioHeight: 1, ratioWidth: 1 };
export const ASPECT_RATIO_LANDSCAPE_16_9: TAspectRatioTarget = { ratioHeight: 9, ratioWidth: 16 };
export const ASPECT_RATIO_LANDSCAPE_4_3: TAspectRatioTarget = { ratioHeight: 3, ratioWidth: 4 };
export const ASPECT_RATIO_LANDSCAPE_3_2: TAspectRatioTarget = { ratioHeight: 2, ratioWidth: 3 };
export const ASPECT_RATIO_PORTRAIT_9_16: TAspectRatioTarget = { ratioHeight: 16, ratioWidth: 9 };
export const ASPECT_RATIO_PORTRAIT_3_4: TAspectRatioTarget = { ratioHeight: 4, ratioWidth: 3 };
export const ASPECT_RATIO_PORTRAIT_2_3: TAspectRatioTarget = { ratioHeight: 3, ratioWidth: 2 };

export const ASPECT_RATIO_PRESETS: TAspectRatioTarget[] = [
  ASPECT_RATIO_ORIGINAL,
  ASPECT_RATIO_SQUARE,
  ASPECT_RATIO_CIRCLE,
  ASPECT_RATIO_LANDSCAPE_16_9,
  ASPECT_RATIO_LANDSCAPE_4_3,
  ASPECT_RATIO_LANDSCAPE_3_2,
  ASPECT_RATIO_PORTRAIT_9_16,
  ASPECT_RATIO_PORTRAIT_3_4,
  ASPECT_RATIO_PORTRAIT_2_3,
];
