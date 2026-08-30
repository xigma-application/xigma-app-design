// types
import { TPoint } from 'types/canvas';
import { TNodeOrigin } from 'types/design/selectionTool/types';
import { TSceneNode } from 'types/design/types';

// utils
import { extendGuideToFullElement } from './extendGuideToFullElement';
import { getCandidateShapes } from './getCandidateShapes';
import { getEligibleDraggedEntries } from './getEligibleDraggedEntries';
import { getGroupAlignmentGuide, type TAlignmentGuide } from '../getGroupAlignmentGuide';
import { getRotatedNodeBounds } from '../getRotatedNodeBounds';
import { getShapeSnapPoints } from '../getShapeSnapPoints';

export type TDragAlignmentSnap = {
  delta: TPoint;
  guide: TAlignmentGuide | null;
};

export const getDragAlignmentSnap = (
  nodes: Record<string, TSceneNode>,
  nodeOrigins: Record<string, TNodeOrigin>,
  rawDelta: TPoint,
  toleranceWorldUnits: number,
): TDragAlignmentSnap => {
  const draggedIds = Object.keys(nodeOrigins);
  const eligibleDraggedEntries = getEligibleDraggedEntries(nodes, nodeOrigins, draggedIds);

  if (eligibleDraggedEntries.length === 0) {
    return { delta: rawDelta, guide: null };
  }

  const draggedPoints = eligibleDraggedEntries.flatMap(({ node, origin }) =>
    getShapeSnapPoints(getRotatedNodeBounds({ ...node, x: origin.x + rawDelta.x, y: origin.y + rawDelta.y } as TSceneNode)),
  );
  const candidateShapes = getCandidateShapes(nodes, draggedIds);
  const candidatePoints = candidateShapes.flatMap((candidate) => candidate.points);
  const { deltaCorrection, guide } = getGroupAlignmentGuide(draggedPoints, candidatePoints, toleranceWorldUnits);

  return {
    delta: { x: rawDelta.x + deltaCorrection.x, y: rawDelta.y + deltaCorrection.y },
    guide: extendGuideToFullElement(guide, candidateShapes),
  };
};
