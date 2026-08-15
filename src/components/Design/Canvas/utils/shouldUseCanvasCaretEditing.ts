// types
import { TEditingTextBox } from 'types/canvas';

export const shouldUseCanvasCaretEditing = (box: TEditingTextBox | null): boolean => Boolean(box);
