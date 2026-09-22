// types
import { BlendMode } from 'types/design/enums';
import { TPaint } from 'types/design/paint/types';

// utils
import { isSvgVectorPaint } from './isSvgVectorPaint';

const hasDefaultImageAdjustments = (paint: TPaint): boolean =>
  paint.type !== 'image' || !paint.adjustments || Object.values(paint.adjustments).every((value) => value === 0);

const isEligibleImagePaint = (paint: TPaint): boolean =>
  (paint.type === 'image' || paint.type === 'video') &&
  Boolean(paint.ref) &&
  hasDefaultImageAdjustments(paint) &&
  (!paint.blendMode || paint.blendMode === BlendMode.normal);

export const isSvgVectorFillPaint = (paint: TPaint): boolean => isSvgVectorPaint(paint) || isEligibleImagePaint(paint);
