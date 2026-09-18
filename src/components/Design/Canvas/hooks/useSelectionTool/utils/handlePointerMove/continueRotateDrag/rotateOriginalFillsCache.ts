// types
import { TPaint } from 'types/design/paint/types';

import { getStrokesCacheKey } from 'components/Design/Canvas/utils/getStrokesCacheKey';

const rotateOriginalFillsCache = new Map<string, TPaint[]>();

export const getRotateOriginalFills = (id: string, currentFills: TPaint[]): TPaint[] => {
  if (!rotateOriginalFillsCache.has(id)) {
    rotateOriginalFillsCache.set(id, currentFills);
  }

  return rotateOriginalFillsCache.get(id) ?? currentFills;
};

export const clearRotateOriginalFills = (id: string): void => {
  rotateOriginalFillsCache.delete(id);
  rotateOriginalFillsCache.delete(getStrokesCacheKey(id));
};
