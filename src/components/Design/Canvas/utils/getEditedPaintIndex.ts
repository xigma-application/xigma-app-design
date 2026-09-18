// store
import { TImageEditorState } from 'store/design/types';

// types
import { TPaintProperty } from 'types/design/paint/types';

export const getEditedPaintIndex = (imageEditor: TImageEditorState | null, property: TPaintProperty): number | null =>
  imageEditor && (imageEditor.property ?? 'fills') === property ? imageEditor.paintIndex : null;
