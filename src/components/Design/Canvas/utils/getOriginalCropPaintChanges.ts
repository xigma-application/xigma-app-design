// store
import { TImageEditorState } from 'store/design/types';

// types
import { TImageFrameNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';
import { TPaint } from 'types/design/paint/types';

// utils
import { getEditedPaintIndex } from './getEditedPaintIndex';
import { getStrokesCacheKey } from './getStrokesCacheKey';

export const getOriginalCropPaintChanges = (
  node: TImageFrameNode,
  getOriginal: (cacheKey: string, currentPaints: TPaint[]) => TPaint[],
  editedImageEditor: TImageEditorState | null,
  transform: (paints: TPaint[], skipPaintIndex: number | null) => TPaint[] | undefined,
): { fills?: TPaint[]; strokes?: TPaint[] } => {
  const fills = transform(getOriginal(node.id, node.fills), getEditedPaintIndex(editedImageEditor, 'fills'));
  const strokes = node.strokes
    ? transform(getOriginal(getStrokesCacheKey(node.id), node.strokes), getEditedPaintIndex(editedImageEditor, 'strokes'))
    : undefined;

  return { ...(fills ? { fills } : {}), ...(strokes ? { strokes } : {}) };
};
