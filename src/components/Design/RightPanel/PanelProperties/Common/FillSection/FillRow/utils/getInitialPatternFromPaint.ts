// types
import { TInitialPattern } from 'shared/UITools/ColorPicker/Body/PatternPanel/types';
import { TPaint } from 'types/design/paint/types';

export const getInitialPatternFromPaint = (paint: TPaint): TInitialPattern | undefined => {
  if (paint.type === 'pattern') {
    const { alignmentIndex, direction, scale, spacingX, spacingY, tileType } = paint;
    return { alignmentIndex, direction, scale, spacingX, spacingY, tileType };
  }

  return undefined;
};
