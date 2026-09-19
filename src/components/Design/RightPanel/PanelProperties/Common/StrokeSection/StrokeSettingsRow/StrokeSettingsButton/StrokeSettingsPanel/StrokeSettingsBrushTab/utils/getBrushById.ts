// @xigma
import { BRUSH_CATEGORIES, TBrush } from '@xigma/utils';

export const getBrushById = (id: string): TBrush | undefined =>
  BRUSH_CATEGORIES.flatMap((category) => category.brushes).find((brush) => brush.id === id);
