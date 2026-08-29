// others
import { ELLIPSE_DEFAULT_ARC_ANGLE } from 'constant/canvas';

// types
import { TDesignState } from '../types';
import { NodeType } from 'types/design/enums';

// utils
import { getActivePage } from './getActivePage';
import { getEllipseArcMajorArc } from 'utils/canvas/ellipseArc/getEllipseArcMajorArc';
import { handleDeleteNode } from './handleDeleteNode';
import { isEmptyVectorNode } from './isEmptyVectorNode';

const isFullyCutAwayEllipse = (state: TDesignState, id: string): boolean => {
  const node = getActivePage(state).nodes[id];

  if (!node || node.type !== NodeType.ellipse) {
    return false;
  }

  const arcStartAngle = node.arcStartAngle ?? ELLIPSE_DEFAULT_ARC_ANGLE;
  const arcEndAngle = node.arcEndAngle ?? ELLIPSE_DEFAULT_ARC_ANGLE;

  return getEllipseArcMajorArc(arcStartAngle, arcEndAngle).majorSweep === 0;
};

const deleteDegenerateDeselectedNodes = (state: TDesignState, deselectedIds: string[]): void => {
  deselectedIds
    .filter((id) => isFullyCutAwayEllipse(state, id) || isEmptyVectorNode(state, id))
    .forEach((id) => handleDeleteNode(state, id));
};

const exitVectorEditingIfNeeded = (state: TDesignState, nextSelectedIds: string[]): void => {
  const exitedIds = state.vectorEditingNodeIds.filter((id) => !nextSelectedIds.includes(id));

  if (exitedIds.length > 0) {
    state.vectorEditingNodeIds = state.vectorEditingNodeIds.filter((id) => !exitedIds.includes(id));
    state.penActiveVertexId = null;

    exitedIds.filter((id) => isEmptyVectorNode(state, id)).forEach((id) => handleDeleteNode(state, id));
  }
};

export const handleSetSelection = (state: TDesignState, nextSelectedIds: string[]): void => {
  const page = getActivePage(state);
  const deselectedIds = page.selectedIds.filter((id) => !nextSelectedIds.includes(id));

  deleteDegenerateDeselectedNodes(state, deselectedIds);
  exitVectorEditingIfNeeded(state, nextSelectedIds);

  page.selectedIds = nextSelectedIds;
};
