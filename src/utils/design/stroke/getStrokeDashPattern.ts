// types
import { StrokeStyle } from 'types/design/enums';

// others
import { STROKE_DASH_DEFAULT, STROKE_DASHES_DEFAULT } from 'constant/strokeDash';

export type TStrokeDashSource = {
  strokeDash?: number;
  strokeDashes?: number[];
  strokeGap?: number;
  strokeStyle?: StrokeStyle;
};

const getPattern = (node: TStrokeDashSource): number[] => {
  switch (node.strokeStyle) {
    case StrokeStyle.dashed: {
      const dash = node.strokeDash ?? STROKE_DASH_DEFAULT;
      return [dash, node.strokeGap ?? dash];
    }
    case StrokeStyle.custom: {
      const dashes = node.strokeDashes ?? STROKE_DASHES_DEFAULT;
      return dashes.length % 2 === 0 ? dashes : [...dashes, ...dashes];
    }
    default:
      return [];
  }
};

export const getStrokeDashPattern = (node: TStrokeDashSource): number[] | null => {
  const pattern = getPattern(node);

  return pattern.reduce((total, length) => total + length, 0) > 0 ? pattern : null;
};
