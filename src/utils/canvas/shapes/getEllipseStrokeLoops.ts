// others
import { ELLIPSE_DEFAULT_ARC_ANGLE, ELLIPSE_SEGMENTS } from 'constant/canvas';

// types
import { TEllipseNode } from 'types/design/types';
import { TPoint } from 'types/canvas';

// utils
import { flipPoint } from 'utils/math/flipPoint';
import { getEllipsePoints } from './getEllipsePoints';
import { getEllipseWorldPoints } from './getEllipseWorldPoints';
import { hasEllipseArc } from '../ellipseArc/hasEllipseArc';
import { rotatePoint } from 'utils/math/rotatePoint';

export type TEllipseStrokeLoop = { isHole: boolean; points: TPoint[] };

const getInnerRingPoints = (node: TEllipseNode, ratio: number): TPoint[] => {
  const center = { x: node.x + node.width / 2, y: node.y + node.height / 2 };
  const rect = {
    height: node.height * ratio,
    width: node.width * ratio,
    x: center.x - (node.width * ratio) / 2,
    y: center.y - (node.height * ratio) / 2,
  };

  return getEllipsePoints(rect, ELLIPSE_SEGMENTS).map((point) =>
    rotatePoint(flipPoint(point, center, node.flipX ?? false, node.flipY ?? false), center, node.rotation),
  );
};

export const getEllipseStrokeLoops = (node: TEllipseNode): TEllipseStrokeLoop[] => {
  const ratio = Math.min(node.arcRatio ?? 0, 1);
  const condition = !hasEllipseArc(node.arcStartAngle ?? ELLIPSE_DEFAULT_ARC_ANGLE, node.arcEndAngle ?? ELLIPSE_DEFAULT_ARC_ANGLE);
  const isRing = condition && ratio > 0;
  const outer = getEllipseWorldPoints(isRing ? { ...node, arcRatio: 0 } : node, node.flipX ?? false, node.flipY ?? false, node.rotation);

  return isRing
    ? [
        { isHole: false, points: outer },
        { isHole: true, points: getInnerRingPoints(node, ratio) },
      ]
    : [{ isHole: false, points: outer }];
};
