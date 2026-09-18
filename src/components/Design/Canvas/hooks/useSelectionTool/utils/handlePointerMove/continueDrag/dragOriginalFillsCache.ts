// types
import { TPaint } from 'types/design/paint/types';

import { getStrokesCacheKey } from 'components/Design/Canvas/utils/getStrokesCacheKey';

const dragOriginalFillsCache = new Map<string, TPaint[]>();

export const getDragOriginalFills = (id: string, currentFills: TPaint[]): TPaint[] => {
  if (!dragOriginalFillsCache.has(id)) {
    dragOriginalFillsCache.set(id, currentFills);
  }

  return dragOriginalFillsCache.get(id) ?? currentFills;
};

export const clearDragOriginalFills = (id: string): void => {
  dragOriginalFillsCache.delete(id);
  dragOriginalFillsCache.delete(getStrokesCacheKey(id));
};
