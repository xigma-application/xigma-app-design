// types
import { TPaint } from 'types/design/paint/types';

export const getFillRowSwatchHex = (paint: TPaint): string => {
  switch (paint.type) {
    case 'pattern':
    case 'image':
      return '#ffffff';
    case 'solid':
      return paint.color;
    default:
      return paint.stops[0]?.color ?? '#000000';
  }
};
