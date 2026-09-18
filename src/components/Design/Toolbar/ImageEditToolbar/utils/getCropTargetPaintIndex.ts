// types
import { TPaint } from 'types/design/paint/types';

export const getCropTargetPaintIndex = (fills: TPaint[], selectedIndices: number[], openPickerIndex?: number): number => {
  const isOpenPickerIndexAnImage = openPickerIndex !== undefined && fills[openPickerIndex]?.type === 'image';
  const selectedImageIndex = fills.findIndex((fill, index) => selectedIndices.includes(index) && fill.type === 'image');

  switch (true) {
    case isOpenPickerIndexAnImage:
      return openPickerIndex as number;
    case selectedImageIndex !== -1:
      return selectedImageIndex;
    default:
      return fills.findIndex((fill) => fill.type === 'image');
  }
};
