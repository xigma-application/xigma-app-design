// types
import { TNodeOrigin } from 'types/design/selectionTool/types';
import { TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { getGroupAlignmentGuide, type TAlignmentGuide } from './getGroupAlignmentGuide';
import { getRotatedNodeBounds } from './getRotatedNodeBounds';
import { getShapeSnapPoints } from './getShapeSnapPoints';
import { isContactGuideEligibleNode } from './getShapeContactGuides';

export type TDragAlignmentSnap = {
  delta: TPoint;
  guide: TAlignmentGuide | null;
};

type TEligibleDraggedEntry = {
  node: TSceneNode;
  origin: { x: number; y: number };
};

const isPlainOrigin = (origin: TNodeOrigin): origin is { x: number; y: number } => 'x' in origin && 'y' in origin;

const getEligibleDraggedEntries = (
  nodes: Record<string, TSceneNode>,
  nodeOrigins: Record<string, TNodeOrigin>,
  draggedIds: string[],
): TEligibleDraggedEntry[] =>
  draggedIds.reduce<TEligibleDraggedEntry[]>((entries, id) => {
    const node = nodes[id];
    const origin = nodeOrigins[id];

    if (node && isPlainOrigin(origin) && isContactGuideEligibleNode(node)) {
      entries.push({ node, origin });
    }

    return entries;
  }, []);

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
  const candidatePoints = Object.values(nodes)
    .filter((node) => !draggedIds.includes(node.id) && isContactGuideEligibleNode(node))
    .flatMap((node) => getShapeSnapPoints(getRotatedNodeBounds(node)));
  const { deltaCorrection, guide } = getGroupAlignmentGuide(draggedPoints, candidatePoints, toleranceWorldUnits);

  return { delta: { x: rawDelta.x + deltaCorrection.x, y: rawDelta.y + deltaCorrection.y }, guide };
};
