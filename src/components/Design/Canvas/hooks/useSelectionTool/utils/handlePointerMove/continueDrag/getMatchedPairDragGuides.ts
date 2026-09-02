// types
import { TDragState } from 'types/design/selectionTool/types';
import { TMatchedPairGuides } from '../../../../../utils/getEqualSpacingGuides/types';
import { TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { getMatchedPairGuides } from '../../../../../utils/getEqualSpacingGuides/getMatchedPairGuides/getMatchedPairGuides';
import { getRotatedNodeBounds } from '../../../../../utils/getRotatedNodeBounds';
import { isContactGuideEligibleNode } from '../../../../../utils/getShapeContactGuides';

export const getMatchedPairDragGuides = (
  nodes: Record<string, TSceneNode>,
  dragState: TDragState,
  delta: TPoint,
  sizeToleranceWorldUnits: number,
  centreToleranceWorldUnits: number,
): TMatchedPairGuides | null => {
  const draggedIds = Object.keys(dragState.nodeOrigins);

  if (draggedIds.length === 1) {
    const [id] = draggedIds;
    const node = nodes[id];
    const origin = dragState.nodeOrigins[id];

    if (!(!node || !isContactGuideEligibleNode(node) || !('x' in origin))) {
      const draggedBounds = getRotatedNodeBounds({ ...node, x: origin.x + delta.x, y: origin.y + delta.y } as TSceneNode);
      const guides = getMatchedPairGuides(draggedBounds, dragState.candidateShapes, sizeToleranceWorldUnits, centreToleranceWorldUnits);

      return guides.lines.length > 0 ? guides : null;
    }
  }

  return null;
};
