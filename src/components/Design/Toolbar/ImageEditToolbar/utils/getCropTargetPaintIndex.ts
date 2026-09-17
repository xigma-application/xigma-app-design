// types
import { TPaint } from 'types/design/paint/types';

export const getCropTargetPaintIndex = (fills: TPaint[], selectedIndices: number[]): number => {
  const selectedImageIndex = fills.findIndex((fill, index) => selectedIndices.includes(index) && fill.type === 'image');

  if (selectedImageIndex !== -1) {
    return selectedImageIndex;
  }

  return fills.findIndex((fill) => fill.type === 'image');
};
