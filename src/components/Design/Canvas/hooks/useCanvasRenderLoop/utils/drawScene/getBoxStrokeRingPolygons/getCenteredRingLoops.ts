// types
import { StrokeAlign, StrokeJoin } from 'types/design/enums';
import { TFrameNode, TRectangleNode } from 'types/design/types';
import { TPoint } from 'types/canvas';

// utils
import { getBoxStrokePolygons } from '../getBoxStrokePolygons';
import { getStrokeSideWidths } from 'utils/design/stroke/getStrokeSideWidths';

export const getCenteredRingLoops = (node: TFrameNode | TRectangleNode): [TPoint[], TPoint[]] => {
  const [outerLoop, innerLoop] = getBoxStrokePolygons(node, getStrokeSideWidths(node), StrokeAlign.center, StrokeJoin.miter);
  return [outerLoop, innerLoop];
};
