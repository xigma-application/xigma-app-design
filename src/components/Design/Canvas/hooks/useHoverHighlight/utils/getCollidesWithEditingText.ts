// others
import { PATH_TEXT_HIT_TOLERANCE_PX, STRAIGHT_TEXT_HIT_TOLERANCE_PX } from 'constant/canvas';

// types
import { TEditingTextBox, TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { getEditingCaretHit } from './getEditingCaretHit';

export const getCollidesWithEditingText = (
  editingTextBox: TEditingTextBox | null,
  editingContent: string,
  point: TPoint,
  zoom: number,
  pathNode?: TSceneNode,
): boolean => {
  const editingHit = getEditingCaretHit(editingTextBox, editingContent, point, pathNode);
  const editingTolerance = (editingTextBox?.pathId ? PATH_TEXT_HIT_TOLERANCE_PX : STRAIGHT_TEXT_HIT_TOLERANCE_PX) / zoom;

  return Boolean(editingHit && editingHit.distance <= editingTolerance);
};
