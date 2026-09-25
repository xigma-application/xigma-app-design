// others
import { ARC_FIELD_LIMITS } from '../../constants';
import { ELLIPSE_DEFAULT_ARC_ANGLE } from 'constant/canvas';

// types
import { TArcFieldKey } from '../../types';
import { TEllipseNode } from 'types/design/types';

// utils
import { clamp } from 'utils/math/clamp';
import { getEllipseArcSweepSpan } from './getEllipseArcSweepSpan';
import { getEllipseArcValues } from './getEllipseArcValues';

export const getEllipseArcChanges = (node: TEllipseNode, key: TArcFieldKey, value: number): Partial<TEllipseNode> => {
  const start = node.arcStartAngle ?? ELLIPSE_DEFAULT_ARC_ANGLE;
  const end = node.arcEndAngle ?? ELLIPSE_DEFAULT_ARC_ANGLE;
  const { max, min } = ARC_FIELD_LIMITS[key];

  switch (key) {
    case 'start': {
      const delta = value - getEllipseArcValues(node).start;
      return { arcEndAngle: end + delta, arcStartAngle: start + delta };
    }
    case 'sweep':
      return { arcEndAngle: start + getEllipseArcSweepSpan(clamp(value, min, max)) };
    default:
      return { arcRatio: clamp(value, min, max) / 100 };
  }
};
