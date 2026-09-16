// types
import { TPaint } from 'types/design/paint/types';

export const useRotateImagePaint = (paint: TPaint, onChange: TFunc<[TPaint]>): TFunc => {
  return (): void => {
    if (paint.type === 'image') {
      onChange({ ...paint, rotation: (paint.rotation + 90) % 360 });
    }
  };
};
