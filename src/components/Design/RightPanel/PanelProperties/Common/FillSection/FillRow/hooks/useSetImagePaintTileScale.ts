// types
import { TPaint } from 'types/design/paint/types';

export const useSetImagePaintTileScale = (paint: TPaint, onChange: TFunc<[TPaint]>): TFunc<[number]> => {
  return (scale): void => {
    if (paint.type === 'image') {
      onChange({ ...paint, scale });
    }
  };
};
