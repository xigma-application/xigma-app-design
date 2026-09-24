// types
import { TDragState } from 'types/design/selectionTool/types';
import { TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { extendGuideToFullElement } from 'components/Design/Canvas/utils/getDragAlignmentSnap/extendGuideToFullElement';
import { getEligibleDraggedEntries } from 'components/Design/Canvas/utils/getDragAlignmentSnap/getEligibleDraggedEntries';
import { getGroupAlignmentGuide, type TAlignmentGuide } from 'components/Design/Canvas/utils/getGroupAlignmentGuide';
import { getStrokedRotatedNodeBounds } from 'components/Design/Canvas/utils/getStrokedRotatedNodeBounds';
import { getShapeSnapPoints } from 'components/Design/Canvas/utils/getShapeSnapPoints';

const pointsByCandidates = new WeakMap<TDragState['candidateShapes'], TPoint[]>();

const getCandidatePoints = (candidateShapes: TDragState['candidateShapes']): TPoint[] => {
  const cached = pointsByCandidates.get(candidateShapes);

  if (!cached) {
    const points = candidateShapes.flatMap((candidate) => candidate.points);
    pointsByCandidates.set(candidateShapes, points);

    return points;
  }

  return cached;
};

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
      getShapeSnapPoints(getStrokedRotatedNodeBounds({ ...node, x: origin.x + rawDelta.x, y: origin.y + rawDelta.y } as TSceneNode)),
    );
    const candidatePoints = getCandidatePoints(candidateShapes);
    const { deltaCorrection, guide } = getGroupAlignmentGuide(draggedPoints, candidatePoints, toleranceWorldUnits);

    return {
      delta: { x: rawDelta.x + deltaCorrection.x, y: rawDelta.y + deltaCorrection.y },
      guide: extendGuideToFullElement(guide, candidateShapes),
    };
  }

  return { delta: rawDelta, guide: null };
};
