// types
import { TEditingTextBox } from 'types/canvas';

export const shouldUseCanvasCaretEditing = (box: TEditingTextBox | null): boolean => {
  let result = false;

  if (box) {
    result = Boolean(box.pathId) || box.rotation !== 0 || box.flipX || box.flipY;
  }

  return result;
};
