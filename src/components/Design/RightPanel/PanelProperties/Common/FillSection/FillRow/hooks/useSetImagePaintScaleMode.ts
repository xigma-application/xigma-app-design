// types
import { TImageFillMode } from 'shared/UITools/ColorPicker/Body/ImagePanel/types';
import { TPaint } from 'types/design/paint/types';

export const useSetImagePaintScaleMode = (paint: TPaint, onChange: TFunc<[TPaint]>): TFunc<[TImageFillMode]> => {
  return (fillMode): void => {
    if (paint.type === 'image' && (fillMode === 'fill' || fillMode === 'fit')) {
      onChange({ ...paint, scaleMode: fillMode });
    }
  };
};
