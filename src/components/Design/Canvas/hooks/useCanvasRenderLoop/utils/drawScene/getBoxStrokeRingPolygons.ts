// types
import { StrokeJoin, StrokeProfile, StrokeSides } from 'types/design/enums';
import { TFrameNode, TRectangleNode } from 'types/design/types';
import { TPoint } from 'types/canvas';

// utils
import { getBoxStrokePolygons } from './getBoxStrokePolygons';
import { getBoxStrokeProfilePolygons } from './getBoxStrokeProfilePolygons';
import { getStrokeSideWidths } from 'utils/design/stroke/getStrokeSideWidths';

export const getBoxStrokeRingPolygons = (node: TFrameNode | TRectangleNode): TPoint[][] => {
  const profile = node.strokeProfile ?? StrokeProfile.uniform;
  const sides = node.strokeSides ?? StrokeSides.all;

  if (node.strokeWidth && profile !== StrokeProfile.uniform && sides === StrokeSides.all) {
    return getBoxStrokeProfilePolygons(node, node.strokeWidth, node.strokeAlign, profile, node.strokeProfileFlipped ?? false);
  }

  return getBoxStrokePolygons(node, getStrokeSideWidths(node), node.strokeAlign, node.strokeJoin ?? StrokeJoin.miter);
};
