// types
import { TImageAdjustments, TPaint } from 'types/design/paint/types';

// utils
import { getImagePaintAdjustments } from 'utils/design/paint/getImagePaintAdjustments';

export const useSetImagePaintAdjustment =
  (paint: TPaint, onChange: TFunc<[TPaint]>): TFunc<[keyof TImageAdjustments, number]> =>
  (field, value): void => {
    if (paint.type === 'image') {
      onChange({ ...paint, adjustments: { ...getImagePaintAdjustments(paint), [field]: value } });
    }
  };
