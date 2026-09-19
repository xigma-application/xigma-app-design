// @xigma
import { BRUSH_CATEGORIES, TBrushCategoryId } from '@xigma/utils';

export const getBrushCategoryId = (brushId: string): TBrushCategoryId | undefined =>
  BRUSH_CATEGORIES.find((category) => category.brushes.some((brush) => brush.id === brushId))?.id;
