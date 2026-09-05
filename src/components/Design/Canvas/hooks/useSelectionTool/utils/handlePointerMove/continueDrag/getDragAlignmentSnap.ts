// types
import { TDragState } from 'types/design/selectionTool/types';
import { TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { extendGuideToFullElement } from 'components/Design/Canvas/utils/getDragAlignmentSnap/extendGuideToFullElement';
import { getEligibleDraggedEntries } from 'components/Design/Canvas/utils/getDragAlignmentSnap/getEligibleDraggedEntries';
import { getGroupAlignmentGuide, type TAlignmentGuide } from 'components/Design/Canvas/utils/getGroupAlignmentGuide';
import { getRotatedNodeBounds } from 'components/Design/Canvas/utils/getRotatedNodeBounds';
import { getShapeSnapPoints } from 'components/Design/Canvas/utils/getShapeSnapPoints';

export type TDragAlignmentSnap = {
  delta: TPoint;
  guide: TAlignmentGuide | null;
};

export const getDragAlignmentSnap = (
  nodes: Record<string, TSceneNode>,
  dragState: TDragState,
  rawDelta: TPoint,
  toleranceWorldUnits: number,
): TDragAlignmentSnap => {
  const { candidateShapes, nodeOrigins } = dragState;
  const draggedIds = Object.keys(nodeOrigins);
  const eligibleDraggedEntries = getEligibleDraggedEntries(nodes, nodeOrigins, draggedIds);

  if (eligibleDraggedEntries.length !== 0) {
    const draggedPoints = eligibleDraggedEntries.flatMap(({ node, origin }) =>
      getShapeSnapPoints(getRotatedNodeBounds({ ...node, x: origin.x + rawDelta.x, y: origin.y + rawDelta.y } as TSceneNode)),
    );
    const candidatePoints = candidateShapes.flatMap((candidate) => candidate.points);
    const { deltaCorrection, guide } = getGroupAlignmentGuide(draggedPoints, candidatePoints, toleranceWorldUnits);

    return {
      delta: { x: rawDelta.x + deltaCorrection.x, y: rawDelta.y + deltaCorrection.y },
      guide: extendGuideToFullElement(guide, candidateShapes),
    };
  }

  return { delta: rawDelta, guide: null };
};
