// types
import { TDragState } from 'types/design/selectionTool/types';
import { TEqualSpacingGuides } from '../../../../../utils/getEqualSpacingGuides/types';
import { TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { getChainSnap } from '../../../../../utils/getEqualSpacingGuides/getChainSnap';
import { getRotatedNodeBounds } from '../../../../../utils/getRotatedNodeBounds';
import { isContactGuideEligibleNode } from '../../../../../utils/getShapeContactGuides';

export type TChainGapDragSnap = { delta: TPoint; guides: TEqualSpacingGuides | null };

const ZERO_DELTA: TPoint = { x: 0, y: 0 };

export const getChainGapDragSnap = (
  nodes: Record<string, TSceneNode>,
  dragState: TDragState,
  delta: TPoint,
  toleranceWorldUnits: number,
): TChainGapDragSnap => {
  const draggedIds = Object.keys(dragState.nodeOrigins);

  if (draggedIds.length === 1) {
    const [id] = draggedIds;
    const node = nodes[id];
    const origin = dragState.nodeOrigins[id];

    if (node && isContactGuideEligibleNode(node) && 'x' in origin) {
      const draggedBounds = getRotatedNodeBounds({ ...node, x: origin.x + delta.x, y: origin.y + delta.y } as TSceneNode);
      const snap = getChainSnap(draggedBounds, dragState.candidateShapes, toleranceWorldUnits);

      return { delta: snap.delta, guides: snap.guides.lines.length > 0 ? snap.guides : null };
    }
  }

  return { delta: ZERO_DELTA, guides: null };
};
