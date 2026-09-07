// types
import { TDimensionHintField, TDimensionHintFrame, TDimensionHintGuides } from './types';

// utils
import { getDimensionHintLocalGuides } from './getDimensionHintLocalGuides';
import { rotateDimensionHintGuides } from './rotateDimensionHintGuides';

export const getDimensionHintGuides = (frame: TDimensionHintFrame, field: TDimensionHintField): TDimensionHintGuides => {
  const { height, rotation = 0, width, x, y } = frame;
  const local = getDimensionHintLocalGuides(frame, field);

  if (rotation === 0) {
    return local;
  }

  return rotateDimensionHintGuides(local, { x: x + width / 2, y: y + height / 2 }, rotation);
};
