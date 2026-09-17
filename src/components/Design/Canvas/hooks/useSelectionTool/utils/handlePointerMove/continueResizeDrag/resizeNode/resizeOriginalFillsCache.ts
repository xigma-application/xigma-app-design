// types
import { TPaint } from 'types/design/paint/types';

const resizeOriginalFillsCache = new Map<string, TPaint[]>();

export const getResizeOriginalFills = (id: string, currentFills: TPaint[]): TPaint[] => {
  if (!resizeOriginalFillsCache.has(id)) {
    resizeOriginalFillsCache.set(id, currentFills);
  }

  return resizeOriginalFillsCache.get(id) ?? currentFills;
};

export const clearResizeOriginalFills = (id: string): void => {
  resizeOriginalFillsCache.delete(id);
};
