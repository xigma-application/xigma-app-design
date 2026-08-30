// others
import { ELLIPSE_DEFAULT_ARC_ANGLE } from 'constant/canvas';

// types
import { TDesignState } from '../../types';
import { NodeType } from 'types/design/enums';

// utils
import { getActivePage } from '../getActivePage';
import { getEllipseArcMajorArc } from 'utils/canvas/ellipseArc/getEllipseArcMajorArc';

export const isFullyCutAwayEllipse = (state: TDesignState, id: string): boolean => {
  const node = getActivePage(state).nodes[id];

  if (!node || node.type !== NodeType.ellipse) {
    return false;
  }

  const arcStartAngle = node.arcStartAngle ?? ELLIPSE_DEFAULT_ARC_ANGLE;
  const arcEndAngle = node.arcEndAngle ?? ELLIPSE_DEFAULT_ARC_ANGLE;

  return getEllipseArcMajorArc(arcStartAngle, arcEndAngle).majorSweep === 0;
};
