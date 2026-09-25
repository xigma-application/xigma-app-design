// types
import { StrokeDashCap } from 'types/design/enums';
import { TFrameNode, TRectangleNode, TSectionNode } from 'types/design/types';
import { TPoint } from 'types/canvas';

// utils
import { getBoxDashedStrokePolygons } from '../getBoxDashedStrokePolygons';
import { getUniformRingPolygons } from './getUniformRingPolygons';

export const getDashedRingPolygons = (node: TFrameNode | TRectangleNode | TSectionNode, dashPattern: number[] | null): TPoint[][] => {
  const [outerLoop, innerLoop] = getUniformRingPolygons(node);

  return (
    getBoxDashedStrokePolygons(outerLoop, innerLoop, dashPattern ?? [], node.strokeDashCap ?? StrokeDashCap.none) ??
    getUniformRingPolygons(node)
  );
};
