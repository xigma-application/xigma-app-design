// types
import { StrokeDashCap, StrokeJoin, StrokeProfile, StrokeSides } from 'types/design/enums';
import { TFrameNode, TRectangleNode } from 'types/design/types';
import { TPoint } from 'types/canvas';

// utils
import { getBoxDashedStrokePolygons } from './getBoxDashedStrokePolygons';
import { getBoxStrokePolygons } from './getBoxStrokePolygons';
import { getBoxStrokeProfilePolygons } from './getBoxStrokeProfilePolygons';
import { getBoxStrokeJoin } from 'utils/design/stroke/getBoxStrokeJoin';
import { getStrokeDashPattern } from 'utils/design/stroke/getStrokeDashPattern';
import { getStrokeSideWidths } from 'utils/design/stroke/getStrokeSideWidths';

type TRingMode = 'dashed' | 'profile' | 'uniform';

const getRingMode = (node: TFrameNode | TRectangleNode, dashPattern: number[] | null): TRingMode => {
  const hasWidth = Boolean(node.strokeWidth);
  const hasProfile =
    (node.strokeProfile ?? StrokeProfile.uniform) !== StrokeProfile.uniform && (node.strokeSides ?? StrokeSides.all) === StrokeSides.all;

  switch (true) {
    case hasWidth && dashPattern !== null:
      return 'dashed';
    case hasWidth && hasProfile:
      return 'profile';
    default:
      return 'uniform';
  }
};

const getUniformRingPolygons = (node: TFrameNode | TRectangleNode): TPoint[][] =>
  getBoxStrokePolygons(
    node,
    getStrokeSideWidths(node),
    node.strokeAlign,
    getBoxStrokeJoin(node.strokeJoin ?? StrokeJoin.miter, node.strokeMiterAngle),
  );

export const getBoxStrokeRingPolygons = (node: TFrameNode | TRectangleNode): TPoint[][] => {
  const dashPattern = getStrokeDashPattern(node);

  switch (getRingMode(node, dashPattern)) {
    case 'dashed': {
      const [outerLoop, innerLoop] = getBoxStrokePolygons(
        node,
        getStrokeSideWidths(node),
        node.strokeAlign,
        getBoxStrokeJoin(node.strokeJoin ?? StrokeJoin.miter, node.strokeMiterAngle),
      );
      return (
        getBoxDashedStrokePolygons(outerLoop, innerLoop, dashPattern ?? [], node.strokeDashCap ?? StrokeDashCap.none) ??
        getUniformRingPolygons(node)
      );
    }
    case 'profile':
      return getBoxStrokeProfilePolygons(
        node,
        node.strokeWidth ?? 0,
        node.strokeAlign,
        node.strokeProfile ?? StrokeProfile.uniform,
        node.strokeProfileFlipped ?? false,
      );
    default:
      return getUniformRingPolygons(node);
  }
};
