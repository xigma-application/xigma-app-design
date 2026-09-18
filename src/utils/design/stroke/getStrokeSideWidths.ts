// types
import { StrokeSides } from 'types/design/enums';
import { TStrokeSideSource, TStrokeSideWidths } from './types';

// utils
import { STROKE_SIDE_WIDTH_KEYS } from './constants';

const NO_WIDTHS: TStrokeSideWidths = { bottom: 0, left: 0, right: 0, top: 0 };

export const getStrokeSideWidths = (node: TStrokeSideSource): TStrokeSideWidths => {
  const width = node.strokeWidth ?? 0;
  const sides = node.strokeSides ?? StrokeSides.all;

  switch (sides) {
    case StrokeSides.all:
      return { bottom: width, left: width, right: width, top: width };
    case StrokeSides.custom:
      return {
        bottom: node[STROKE_SIDE_WIDTH_KEYS.bottom] ?? 0,
        left: node[STROKE_SIDE_WIDTH_KEYS.left] ?? 0,
        right: node[STROKE_SIDE_WIDTH_KEYS.right] ?? 0,
        top: node[STROKE_SIDE_WIDTH_KEYS.top] ?? 0,
      };
    default:
      return { ...NO_WIDTHS, [sides]: width };
  }
};
