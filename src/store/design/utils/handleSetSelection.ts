// others
import { ELLIPSE_DEFAULT_ARC_ANGLE } from 'constant/canvas';

// types
import { TDesignState } from '../types';
import { NodeType } from 'types/design/enums';

// utils
import { getEllipseArcMajorArc } from 'utils/canvas/ellipseArc/getEllipseArcMajorArc';
import { handleDeleteNode } from './handleDeleteNode';

const isFullyCutAwayEllipse = (state: TDesignState, id: string): boolean => {
  const node = state.nodes[id];

  if (!node || node.type !== NodeType.ellipse) {
    return false;
  }

  const arcStartAngle = node.arcStartAngle ?? ELLIPSE_DEFAULT_ARC_ANGLE;
  const arcEndAngle = node.arcEndAngle ?? ELLIPSE_DEFAULT_ARC_ANGLE;

  return getEllipseArcMajorArc(arcStartAngle, arcEndAngle).majorSweep === 0;
};

export const handleSetSelection = (state: TDesignState, nextSelectedIds: string[]): void => {
  const deselectedIds = state.selectedIds.filter((id) => !nextSelectedIds.includes(id));

  deselectedIds.filter((id) => isFullyCutAwayEllipse(state, id)).forEach((id) => handleDeleteNode(state, id));

  state.selectedIds = nextSelectedIds;
};
