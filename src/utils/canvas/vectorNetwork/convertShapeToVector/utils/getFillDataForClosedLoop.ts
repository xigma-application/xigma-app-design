// types
import { TClosedLoopFillData, getClosedLoopPaintFillData } from './getClosedLoopPaintFillData';
import { TVectorNode } from 'types/design/types';

// utils
import { makeSolidPaint } from 'utils/design/paint/makeSolidPaint';

export const getFillDataForClosedLoop = (node: TVectorNode, fillColor: string): TClosedLoopFillData =>
  getClosedLoopPaintFillData(node, [makeSolidPaint(fillColor)]);
