// @xigma
import { BRUSH_CATEGORIES } from '@xigma/utils';

// types
import { TBrushShape } from './types';

// utils
import { computeBrushShape } from './computeBrushShape';
import { getBrushImageUrl } from './getBrushImageUrl';
import { loadBrushAlpha } from './loadBrushAlpha';

const shapes = new Map<string, TBrushShape>();
const requested = new Set<string>();

const loadShape = async (brushId: string): Promise<void> => {
  const brush = BRUSH_CATEGORIES.flatMap((category) => category.brushes).find((candidate) => candidate.id === brushId);
  const url = brush ? getBrushImageUrl(brush.imageFile) : '';
  const alpha = url ? await loadBrushAlpha(url) : null;
  const shape = alpha ? computeBrushShape(alpha) : null;

  if (shape) {
    shapes.set(brushId, shape);
  }
};

export const getBrushShape = (brushId: string): TBrushShape | null => {
  if (!requested.has(brushId)) {
    requested.add(brushId);
    loadShape(brushId).catch(() => undefined);
  }

  return shapes.get(brushId) ?? null;
};
