// types
import { TResizeNodeOrigin } from 'types/design/selectionTool/types';

export const getSingleRotatableOrigin = (
  originEntries: [string, TResizeNodeOrigin][],
): Exclude<TResizeNodeOrigin, { x1: number; x2: number; y1: number; y2: number }> | null => {
  const [singleOriginEntry] = originEntries;

  return originEntries.length === 1 && !('x1' in singleOriginEntry[1]) ? singleOriginEntry[1] : null;
};
