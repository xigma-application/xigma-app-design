// others
import { ELLIPSE_DEFAULT_ARC_ANGLE } from 'constant/canvas';

// types
import { TDesignState } from '../types';
import { NodeType } from 'types/design/enums';

// utils
import { getEllipseArcMajorArc } from 'utils/canvas/ellipseArc/getEllipseArcMajorArc';
import { handleDeleteNode } from './handleDeleteNode';
import { isEmptyVectorNode } from './isEmptyVectorNode';

const isFullyCutAwayEllipse = (state: TDesignState, id: string): boolean => {
  const node = state.nodes[id];

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
  const staysSoleSelection = nextSelectedIds.length === 1 && nextSelectedIds[0] === state.vectorEditingNodeId;

  if (state.vectorEditingNodeId && !staysSoleSelection) {
    const exitedVectorEditingNodeId = state.vectorEditingNodeId;

    state.vectorEditingNodeId = null;
    state.penActiveVertexId = null;

    if (isEmptyVectorNode(state, exitedVectorEditingNodeId)) {
      handleDeleteNode(state, exitedVectorEditingNodeId);
    }
  }
};

export const handleSetSelection = (state: TDesignState, nextSelectedIds: string[]): void => {
  const deselectedIds = state.selectedIds.filter((id) => !nextSelectedIds.includes(id));

  deleteDegenerateDeselectedNodes(state, deselectedIds);
  exitVectorEditingIfNeeded(state, nextSelectedIds);

  state.selectedIds = nextSelectedIds;
};
