// types
import { TDraftRect, TPoint, TResizeHandle } from 'types/canvas';

// utils
import { getResizeAxisAnchors } from './getResizeAxisAnchors';

export const getResizeAnchorPoint = (handle: TResizeHandle, origin: TDraftRect): TPoint | null => {
  const { x, y } = getResizeAxisAnchors(handle, origin);

  return x !== null && y !== null ? { x, y } : null;
};
