// types
import { TImageAdjustments, TImagePaint } from 'types/design/paint/types';

// others
import { DEFAULT_IMAGE_ADJUSTMENTS } from 'constant/canvas';

export const getImagePaintAdjustments = (paint: TImagePaint): TImageAdjustments => paint.adjustments ?? DEFAULT_IMAGE_ADJUSTMENTS;
