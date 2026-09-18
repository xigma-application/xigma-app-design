// types
import { TContrastUnsupportedReason } from 'shared/UITools/ColorPicker/Body/SolidPanel/ContrastChecker/types';
import { TPaint } from 'types/design/paint/types';

export const getBackgroundPaintReason = (paint: Exclude<TPaint, { type: 'solid' }>): TContrastUnsupportedReason => {
  switch (paint.type) {
    case 'image':
      return 'imageBackground';
    case 'pattern':
      return 'patternBackground';
    case 'video':
      return 'videoBackground';
    default:
      return 'gradientBackground';
  }
};
