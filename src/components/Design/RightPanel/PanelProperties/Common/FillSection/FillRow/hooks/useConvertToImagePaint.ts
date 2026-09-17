// types
import { TImagePaint, TPaint } from 'types/design/paint/types';
import { TImagePanelChange } from 'shared/UITools/ColorPicker/Body/ImagePanel/types';

export const useConvertToImagePaint = (paint: TPaint, onChange: TFunc<[TImagePaint]>): TFunc<[TImagePanelChange]> => {
  return (change: TImagePanelChange): void => {
    if (paint.type === 'image') {
      onChange({ ...paint, ...change });
    } else {
      onChange({ ...change, blendMode: paint.blendMode, opacity: paint.opacity, rotation: 0, type: 'image', visible: paint.visible });
    }
  };
};
