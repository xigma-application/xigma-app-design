// types
import { TDimensionHintField, TDimensionHintFrame, TDimensionHintGuides } from './types';

// utils
import { getDimensionHintEdgeGuide } from './getDimensionHintEdgeGuide';
import { getDimensionHintMaxGuide } from './getDimensionHintMaxGuide';
import { getDimensionHintMinGuide } from './getDimensionHintMinGuide';
import { mergeDimensionHintGuides } from './mergeDimensionHintGuides';

export const getDimensionHintLocalGuides = (frame: TDimensionHintFrame, field: TDimensionHintField): TDimensionHintGuides => {
  switch (field) {
    case 'height':
      return mergeDimensionHintGuides(
        getDimensionHintEdgeGuide(frame, false),
        getDimensionHintMinGuide(frame, false),
        getDimensionHintMaxGuide(frame, false),
      );
    case 'maxHeight':
      return getDimensionHintMaxGuide(frame, false);
    case 'maxWidth':
      return getDimensionHintMaxGuide(frame, true);
    case 'minHeight':
      return getDimensionHintMinGuide(frame, false);
    case 'minWidth':
      return getDimensionHintMinGuide(frame, true);
    default:
      return mergeDimensionHintGuides(
        getDimensionHintEdgeGuide(frame, true),
        getDimensionHintMinGuide(frame, true),
        getDimensionHintMaxGuide(frame, true),
      );
  }
};
