// @xigma
import { BRUSH_CATEGORIES } from '@xigma/utils';

export type TStrokeBrushCategory = { category: 'scatter' | 'stretch'; index: number };

export const getStrokeBrushCategory = (brushId: string): TStrokeBrushCategory | undefined => {
  const category = BRUSH_CATEGORIES.find((candidate) => candidate.brushes.some((brush) => brush.id === brushId));

  if (category && (category.id === 'scatter' || category.id === 'stretch')) {
    return { category: category.id, index: category.brushes.findIndex((brush) => brush.id === brushId) };
  }
};
