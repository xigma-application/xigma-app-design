// types
import { StrokeJoin } from 'types/design/enums';
import { TFrameNode, TRectangleNode, TSectionNode } from 'types/design/types';
import { TPoint } from 'types/canvas';

// utils
import { getBoxStrokeJoin } from 'utils/design/stroke/getBoxStrokeJoin';
import { getBoxStrokePolygons } from '../getBoxStrokePolygons';
import { getStrokeSideWidths } from 'utils/design/stroke/getStrokeSideWidths';

export const getUniformRingPolygons = (node: TFrameNode | TRectangleNode | TSectionNode): TPoint[][] =>
  getBoxStrokePolygons(
    node,
    getStrokeSideWidths(node),
    node.strokeAlign,
    getBoxStrokeJoin(node.strokeJoin ?? StrokeJoin.miter, node.strokeMiterAngle),
  );
