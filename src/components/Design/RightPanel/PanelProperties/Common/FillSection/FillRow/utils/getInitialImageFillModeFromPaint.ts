// types
import { TImageFillMode } from 'shared/UITools/ColorPicker/Body/ImagePanel/types';
import { TPaint } from 'types/design/paint/types';

export const getInitialImageFillModeFromPaint = (paint: TPaint): TImageFillMode | undefined => {
  if (paint.type === 'image' || paint.type === 'video') {
    if (paint.crop) {
      return 'crop';
    }

    return paint.scaleMode === 'fit' || paint.scaleMode === 'tile' ? paint.scaleMode : 'fill';
  }

  return undefined;
};
