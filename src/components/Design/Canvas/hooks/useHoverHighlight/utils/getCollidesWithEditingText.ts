// others
import { PATH_TEXT_HIT_TOLERANCE_PX, STRAIGHT_TEXT_HIT_TOLERANCE_PX } from 'constant/canvas';

// types
import { TEditingTextBox, TPoint } from 'types/canvas';

// utils
import { getEditingCaretHit } from './getEditingCaretHit';

export const getCollidesWithEditingText = (
  editingTextBox: TEditingTextBox | null,
  editingContent: string,
  point: TPoint,
  zoom: number,
): boolean => {
  const editingHit = getEditingCaretHit(editingTextBox, editingContent, point);
  const editingTolerance = (editingTextBox?.pathId ? PATH_TEXT_HIT_TOLERANCE_PX : STRAIGHT_TEXT_HIT_TOLERANCE_PX) / zoom;

  return Boolean(editingHit && editingHit.distance <= editingTolerance);
};
