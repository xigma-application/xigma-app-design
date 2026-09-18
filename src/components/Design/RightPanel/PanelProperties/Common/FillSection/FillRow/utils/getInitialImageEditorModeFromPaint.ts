// store
import { TImageEditorMode } from 'store/design/types';

// types
import { TPaint } from 'types/design/paint/types';

export const getInitialImageEditorModeFromPaint = (paint: TPaint): TImageEditorMode => {
  if (paint.type === 'image' || paint.type === 'video') {
    if (paint.scaleMode === 'tile') {
      return 'tile';
    } else if (paint.crop) {
      return 'crop';
    }
  }

  return 'position';
};
